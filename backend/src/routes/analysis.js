import express from 'express';
import { body, param, validationResult } from 'express-validator';
import PerplexityService from '../services/perplexityService.js';
import DataForSEOService from '../services/dataForSEOService.js';
import ClaudeService from '../services/claudeService.js';
import { asyncHandler } from '../middleware/errorHandling.js';
import { createLogger, format, transports } from 'winston';

const router = express.Router();

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'analysis-routes' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ],
});

// Initialize services
const perplexityService = new PerplexityService();
const dataForSEOService = new DataForSEOService();
const claudeService = new ClaudeService();

// Validation middleware
const validateURL = [
  body('url')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Valid URL is required')
    .normalizeEmail(),
  body('location')
    .optional()
    .isString()
    .trim()
    .withMessage('Location must be a string'),
];

const validateKeywords = [
  body('keywords')
    .isArray({ min: 1 })
    .withMessage('Keywords array is required with at least one keyword'),
  body('keywords.*')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each keyword must be a non-empty string under 100 characters'),
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors.array()
      }
    });
  }
  next();
};

// POST /api/analysis/start - Start complete SEO analysis
router.post('/start', 
  validateURL, 
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { url, location = 'United States' } = req.body;
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info(`Starting SEO analysis for ${url}`, { analysisId });

    try {
      // Step 1: Extract seed keywords using Perplexity
      logger.info('Step 1: Extracting seed keywords', { analysisId });
      const seedKeywordData = await perplexityService.extractSeedKeywords(url);
      
      // Step 2: Rank keywords by commercial intent
      logger.info('Step 2: Ranking keywords by intent', { analysisId });
      const rankedKeywords = await perplexityService.rankKeywordsByIntent(seedKeywordData.seedKeywords);
      
      // Step 3: Get detailed keyword data from DataForSEO
      logger.info('Step 3: Getting keyword data from DataForSEO', { analysisId });
      const keywordAnalysis = await dataForSEOService.getKeywordData(
        rankedKeywords.rankedKeywords.slice(0, 10), // Limit to top 10 for cost control
        location
      );
      
      // Step 4: Get keyword suggestions for expansion
      logger.info('Step 4: Getting keyword suggestions', { analysisId });
      const topKeyword = rankedKeywords.rankedKeywords[0]?.keyword;
      const keywordSuggestions = await dataForSEOService.getKeywordSuggestions(topKeyword, 20, location);
      
      // Step 5: Perform competitive gap analysis
      logger.info('Step 5: Performing competitive gap analysis', { analysisId });
      const gapAnalysis = await perplexityService.competitiveGapAnalysis(
        keywordAnalysis.map(k => k.keyword)
      );
      
      // Step 6: Generate comprehensive SEO strategy using Claude
      logger.info('Step 6: Generating SEO strategy with Claude', { analysisId });
      const seoStrategy = await claudeService.createSEOStrategy(
        keywordAnalysis,
        gapAnalysis,
        url
      );
      
      // Step 7: Generate content recommendations
      logger.info('Step 7: Generating content recommendations', { analysisId });
      const contentRecommendations = await claudeService.generateContentRecommendations(
        seoStrategy,
        seoStrategy.keywordStrategy.keywordClusters
      );

      // Compile final results
      const analysis = {
        id: analysisId,
        url,
        location,
        timestamp: new Date().toISOString(),
        status: 'completed',
        results: {
          seedKeywords: seedKeywordData,
          rankedKeywords: rankedKeywords,
          keywordAnalysis: keywordAnalysis,
          keywordSuggestions: keywordSuggestions,
          competitiveGaps: gapAnalysis,
          seoStrategy: seoStrategy,
          contentRecommendations: contentRecommendations
        },
        summary: {
          totalKeywords: keywordAnalysis.length,
          totalSuggestions: keywordSuggestions.length,
          contentPieces: contentRecommendations.contentPieces?.length || 0,
          topOpportunity: rankedKeywords.insights?.topOpportunity || 'Not identified',
          estimatedTrafficPotential: keywordAnalysis.reduce((sum, k) => sum + (k.searchVolume || 0), 0)
        }
      };

      logger.info(`SEO analysis completed successfully`, { 
        analysisId, 
        keywordCount: analysis.summary.totalKeywords,
        contentPieces: analysis.summary.contentPieces
      });

      res.json({
        success: true,
        data: analysis
      });

    } catch (error) {
      logger.error(`SEO analysis failed`, { 
        analysisId, 
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        error: {
          message: 'Analysis failed',
          details: error.message,
          analysisId
        }
      });
    }
  })
);

// POST /api/analysis/keywords - Analyze specific keywords
router.post('/keywords',
  validateKeywords,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { keywords, location = 'United States' } = req.body;
    
    logger.info(`Analyzing ${keywords.length} specific keywords`);

    try {
      // Get keyword data from DataForSEO
      const keywordData = await dataForSEOService.getKeywordData(keywords, location);
      
      // Rank by commercial intent using Perplexity
      const rankedResults = await perplexityService.rankKeywordsByIntent(keywords);
      
      // Combine data
      const analysis = keywordData.map(kd => {
        const ranked = rankedResults.rankedKeywords.find(r => r.keyword === kd.keyword);
        return {
          ...kd,
          commercialIntent: ranked?.commercialScore || 50,
          rank: ranked?.rank || null,
          purchaseIntent: ranked?.purchaseIntent || 'unknown'
        };
      });

      res.json({
        success: true,
        data: {
          keywords: analysis,
          insights: rankedResults.insights,
          summary: {
            totalKeywords: analysis.length,
            averageVolume: Math.round(analysis.reduce((sum, k) => sum + k.searchVolume, 0) / analysis.length),
            highIntentKeywords: analysis.filter(k => k.commercialIntent > 70).length
          }
        }
      });

    } catch (error) {
      logger.error('Keyword analysis failed:', error.message);
      res.status(500).json({
        success: false,
        error: {
          message: 'Keyword analysis failed',
          details: error.message
        }
      });
    }
  })
);

// GET /api/analysis/suggestions/:keyword - Get keyword suggestions
router.get('/suggestions/:keyword',
  param('keyword').isString().trim().isLength({ min: 1, max: 100 }),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { keyword } = req.params;
    const { limit = 50, location = 'United States' } = req.query;
    
    logger.info(`Getting keyword suggestions for: ${keyword}`);

    try {
      const suggestions = await dataForSEOService.getKeywordSuggestions(
        keyword, 
        Math.min(parseInt(limit), 100), // Cap at 100 for performance
        location
      );

      res.json({
        success: true,
        data: {
          seedKeyword: keyword,
          suggestions: suggestions,
          summary: {
            totalSuggestions: suggestions.length,
            averageVolume: Math.round(suggestions.reduce((sum, s) => sum + s.searchVolume, 0) / suggestions.length),
            totalPotentialTraffic: suggestions.reduce((sum, s) => sum + s.searchVolume, 0)
          }
        }
      });

    } catch (error) {
      logger.error('Keyword suggestions failed:', error.message);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get keyword suggestions',
          details: error.message
        }
      });
    }
  })
);

// GET /api/analysis/serp/:keyword - Get SERP analysis
router.get('/serp/:keyword',
  param('keyword').isString().trim().isLength({ min: 1, max: 100 }),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { keyword } = req.params;
    const { location = 'United States' } = req.query;
    
    logger.info(`Getting SERP analysis for: ${keyword}`);

    try {
      const serpAnalysis = await dataForSEOService.getSERPAnalysis(keyword, location);

      res.json({
        success: true,
        data: serpAnalysis
      });

    } catch (error) {
      logger.error('SERP analysis failed:', error.message);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get SERP analysis',
          details: error.message
        }
      });
    }
  })
);

// GET /api/analysis/health - Health check for all services
router.get('/health', asyncHandler(async (req, res) => {
  logger.info('Running health check for all analysis services');

  const healthChecks = await Promise.allSettled([
    perplexityService.healthCheck().then(result => ({ service: 'perplexity', ...result })),
    dataForSEOService.healthCheck().then(result => ({ service: 'dataforseo', ...result })),
    claudeService.healthCheck().then(result => ({ service: 'claude', ...result }))
  ]);

  const results = healthChecks.map(check => {
    if (check.status === 'fulfilled') {
      return check.value;
    } else {
      return {
        service: 'unknown',
        status: 'unhealthy',
        error: check.reason.message
      };
    }
  });

  const allHealthy = results.every(r => r.status === 'healthy');

  res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    data: {
      overall: allHealthy ? 'healthy' : 'degraded',
      services: results,
      timestamp: new Date().toISOString()
    }
  });
}));

export default router;