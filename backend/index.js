import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createLogger, format, transports } from 'winston';

// Import our services
import PerplexityService from './src/services/perplexityService.js';
import DataForSEOService from './src/services/dataForSEOService.js';
import ClaudeService from './src/services/claudeService.js';

// Define secrets
const perplexityApiKey = defineSecret('PERPLEXITY_API_KEY');
const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

const app = express();

// Configure Winston logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'seo-analysis-backend' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ],
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });
  next();
});

// Initialize services function (called at runtime)
const initializeServices = () => {
  try {
    const perplexityService = new PerplexityService(perplexityApiKey.value());
    const claudeService = new ClaudeService(anthropicApiKey.value());
    const dataForSEOService = new DataForSEOService(); // Will use mock mode if no credentials
    logger.info('Services initialized successfully');
    return { perplexityService, claudeService, dataForSEOService };
  } catch (error) {
    logger.error('Error initializing services:', error.message);
    return { perplexityService: null, claudeService: null, dataForSEOService: null };
  }
};

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { perplexityService, claudeService, dataForSEOService } = initializeServices();
    const serviceHealth = {};
    
    if (perplexityService) {
      try {
        await perplexityService.healthCheck();
        serviceHealth.perplexity = 'healthy';
      } catch (error) {
        serviceHealth.perplexity = 'unhealthy';
      }
    }
    
    if (claudeService) {
      try {
        await claudeService.healthCheck();
        serviceHealth.claude = 'healthy';
      } catch (error) {
        serviceHealth.claude = 'unhealthy';
      }
    }
    
    if (dataForSEOService) {
      try {
        await dataForSEOService.healthCheck();
        serviceHealth.dataforseo = 'healthy';
      } catch (error) {
        serviceHealth.dataforseo = 'mock_mode';
      }
    }

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: 'Firebase Functions',
      services: serviceHealth
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Full SEO Analysis endpoint
app.post('/analysis/start', async (req, res) => {
  const { url, location = 'United States' } = req.body;
  
  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'URL is required'
    });
  }

  const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  logger.info(`Starting SEO analysis for ${url}`, { analysisId });

  try {
    // Initialize services at runtime
    const { perplexityService, claudeService, dataForSEOService } = initializeServices();
    
    // Check if services are available
    if (!perplexityService || !claudeService || !dataForSEOService) {
      throw new Error('Services not properly initialized');
    }

    // Step 1: Extract seed keywords using Perplexity
    logger.info('Step 1: Extracting seed keywords', { analysisId });
    const seedKeywordData = await perplexityService.extractSeedKeywords(url);
    
    // Step 2: Rank keywords by commercial intent
    logger.info('Step 2: Ranking keywords by intent', { analysisId });
    const rankedKeywords = await perplexityService.rankKeywordsByIntent(seedKeywordData.seedKeywords);
    
    // Step 3: Get detailed keyword data from DataForSEO
    logger.info('Step 3: Getting keyword data from DataForSEO', { analysisId });
    const keywordAnalysis = await dataForSEOService.getKeywordData(
      rankedKeywords.rankedKeywords.slice(0, 5), // Limit to top 5 for Firebase timeout
      location
    );
    
    // Step 4: Get keyword suggestions for expansion
    logger.info('Step 4: Getting keyword suggestions', { analysisId });
    const topKeyword = rankedKeywords.rankedKeywords[0]?.keyword;
    const keywordSuggestions = await dataForSEOService.getKeywordSuggestions(topKeyword, 10, location);
    
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
});

// Keyword analysis endpoint
app.post('/analysis/keywords', async (req, res) => {
  const { keywords, location = 'United States' } = req.body;
  
  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Keywords array is required'
    });
  }
  
  logger.info(`Analyzing ${keywords.length} specific keywords`);

  try {
    const { perplexityService, dataForSEOService } = initializeServices();
    
    if (!dataForSEOService || !perplexityService) {
      throw new Error('Services not available');
    }

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
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI-Driven SEO Analysis Platform API',
    version: '1.0.0',
    status: 'ready',
    environment: 'Firebase Functions',
    endpoints: {
      health: '/health',
      startAnalysis: 'POST /analysis/start',
      keywords: 'POST /analysis/keywords'
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Export as Firebase Function with environment parameters
export const api = onRequest({
  timeoutSeconds: 540, // 9 minutes for complex analysis
  memory: '2GiB',
  cors: true,
  secrets: [perplexityApiKey, anthropicApiKey]
}, app);