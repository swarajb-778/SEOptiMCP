import axios from 'axios';
import { createLogger, format, transports } from 'winston';
import { defineSecret } from 'firebase-functions/params';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'perplexity-service' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ],
});

class PerplexityService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.PERPLEXITY_API_KEY;
    this.baseURL = 'https://api.perplexity.ai';
    this.model = 'llama-3.1-sonar-small-128k-online';
    
    if (!this.apiKey) {
      logger.warn('PERPLEXITY_API_KEY not provided - service will fail until initialized with key');
    }

    if (this.apiKey) {
      this.client = axios.create({
        baseURL: this.baseURL,
        timeout: 30000,
      });
    }
  }

  async extractSeedKeywords(url) {
    try {
      logger.info(`Extracting seed keywords for URL: ${url}`);

      const prompt = `
Analyze the website at ${url} and extract 3-5 high-value seed keywords that represent the core business offerings and have strong commercial intent.

Consider:
1. Primary products/services offered
2. Target audience and use cases  
3. Business model and value propositions
4. Market positioning and competitive advantages

For each keyword, provide:
- The exact keyword phrase
- Commercial intent score (1-100)
- Search volume potential (estimated)
- Business relevance score (1-100)

Return only a JSON object with this structure:
{
  "seedKeywords": [
    {
      "keyword": "exact keyword phrase",
      "commercialIntent": 85,
      "searchVolume": "high|medium|low", 
      "businessRelevance": 90,
      "reasoning": "Brief explanation why this keyword is valuable"
    }
  ],
  "websiteAnalysis": {
    "businessType": "description",
    "targetAudience": "description",
    "primaryOfferings": ["offering1", "offering2"]
  }
}
`;

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO and keyword research specialist. Analyze websites and extract high-commercial-intent keywords that drive revenue.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      const content = response.data.choices[0].message.content;
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Perplexity response');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      logger.info(`Successfully extracted ${result.seedKeywords.length} seed keywords`);
      return result;

    } catch (error) {
      logger.error('Error extracting seed keywords:', {
        error: error.message,
        url,
        stack: error.stack
      });
      throw new Error(`Failed to extract seed keywords: ${error.message}`);
    }
  }

  async rankKeywordsByIntent(keywords) {
    try {
      logger.info(`Ranking ${keywords.length} keywords by commercial intent`);

      const prompt = `
Analyze and rank these keywords by their money-driving commercial intent and business value:

Keywords: ${keywords.map(k => typeof k === 'string' ? k : k.keyword).join(', ')}

For each keyword, evaluate:
1. Purchase intent (how likely someone is to buy)
2. Business value (revenue potential)
3. Conversion likelihood (leads to action)
4. Market competitiveness
5. Long-term SEO value

Rank them from highest to lowest commercial intent and return JSON:
{
  "rankedKeywords": [
    {
      "keyword": "exact keyword",
      "rank": 1,
      "commercialScore": 95,
      "purchaseIntent": "high|medium|low",
      "businessValue": 90,
      "conversionLikelihood": 85,
      "reasoning": "Why this keyword ranks high"
    }
  ],
  "insights": {
    "topOpportunity": "best keyword with reasoning",
    "quickWins": ["keywords with low competition but good intent"],
    "longTermTargets": ["high-value competitive keywords"]
  }
}
`;

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a conversion optimization expert who understands commercial keyword intent and revenue potential.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1200,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in ranking response');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      logger.info(`Successfully ranked keywords, top keyword: ${result.rankedKeywords[0]?.keyword}`);
      return result;

    } catch (error) {
      logger.error('Error ranking keywords:', {
        error: error.message,
        keywords: keywords.length,
        stack: error.stack
      });
      throw new Error(`Failed to rank keywords: ${error.message}`);
    }
  }

  async competitiveGapAnalysis(keywordData) {
    try {
      logger.info('Performing competitive gap analysis');

      const keywords = keywordData.map(k => k.keyword || k).join(', ');
      
      const prompt = `
Perform a competitive gap analysis for these keywords: ${keywords}

Analyze:
1. Market gaps and underserved niches
2. Content opportunities competitors are missing
3. Long-tail keyword variations with less competition
4. Semantic keyword clusters
5. Question-based and conversational queries

Return JSON analysis:
{
  "gapAnalysis": {
    "contentGaps": [
      {
        "opportunity": "specific content type/topic",
        "keywords": ["related keywords"],
        "difficulty": "low|medium|high",
        "potential": "traffic/revenue potential",
        "reasoning": "why this is a gap"
      }
    ],
    "semanticClusters": [
      {
        "theme": "cluster theme",
        "keywords": ["related keywords"],
        "intent": "informational|commercial|transactional",
        "competition": "low|medium|high"
      }
    ],
    "longTailOpportunities": [
      {
        "keyword": "specific long-tail keyword",
        "parentKeyword": "main keyword",
        "searchIntent": "intent description",
        "difficulty": "score 1-100"
      }
    ]
  },
  "competitorWeaknesses": [
    "areas where competitors are weak"
  ],
  "quickWinOpportunities": [
    "immediate opportunities to capture"
  ]
}
`;

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a competitive intelligence expert specializing in SEO gap analysis and market opportunity identification.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1500,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in gap analysis response');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      logger.info(`Competitive gap analysis completed with ${result.gapAnalysis.contentGaps.length} content gaps identified`);
      return result;

    } catch (error) {
      logger.error('Error in competitive gap analysis:', {
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to perform gap analysis: ${error.message}`);
    }
  }

  async healthCheck() {
    try {
      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'user',
            content: 'Reply with just "OK" to confirm the API is working.'
          }
        ],
        max_tokens: 10,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      return {
        status: 'healthy',
        model: this.model,
        responseTime: response.headers['x-response-time'] || 'unknown',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Perplexity health check failed:', error.message);
      throw new Error(`Perplexity API health check failed: ${error.message}`);
    }
  }
}

export default PerplexityService;