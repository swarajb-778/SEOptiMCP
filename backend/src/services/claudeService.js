import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';

dotenv.config();

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'claude-service' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ],
});

class ClaudeService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY;
    this.model = 'claude-3-5-sonnet-20241022';
    
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY not found in environment variables');
    }

    this.client = new Anthropic({
      apiKey: this.apiKey,
    });
  }

  async createSEOStrategy(keywordData, competitiveData, websiteUrl) {
    try {
      logger.info(`Creating SEO strategy for ${websiteUrl} with ${keywordData.length} keywords`);

      const prompt = this._buildSEOStrategyPrompt(keywordData, competitiveData, websiteUrl);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0].text;
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Claude response');
      }

      const strategy = JSON.parse(jsonMatch[0]);
      
      // Add metadata
      strategy.metadata = {
        generatedAt: new Date().toISOString(),
        websiteUrl,
        keywordCount: keywordData.length,
        model: this.model
      };

      logger.info('SEO strategy created successfully');
      return strategy;

    } catch (error) {
      logger.error('Error creating SEO strategy:', {
        error: error.message,
        websiteUrl,
        stack: error.stack
      });
      throw new Error(`Failed to create SEO strategy: ${error.message}`);
    }
  }

  async generateContentRecommendations(seoStrategy, keywordClusters) {
    try {
      logger.info('Generating content recommendations based on SEO strategy');

      const prompt = this._buildContentRecommendationsPrompt(seoStrategy, keywordClusters);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4000,
        temperature: 0.4,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0].text;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in content recommendations response');
      }

      const recommendations = JSON.parse(jsonMatch[0]);
      
      // Add metadata
      recommendations.metadata = {
        generatedAt: new Date().toISOString(),
        strategyClusters: keywordClusters.length,
        model: this.model
      };

      logger.info(`Generated ${recommendations.contentPieces?.length || 0} content recommendations`);
      return recommendations;

    } catch (error) {
      logger.error('Error generating content recommendations:', {
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to generate content recommendations: ${error.message}`);
    }
  }

  async optimizeContentPiece(contentOutline, targetKeywords, competitorAnalysis) {
    try {
      logger.info(`Optimizing content piece for keywords: ${targetKeywords.join(', ')}`);

      const prompt = this._buildContentOptimizationPrompt(contentOutline, targetKeywords, competitorAnalysis);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 3000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0].text;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in content optimization response');
      }

      const optimization = JSON.parse(jsonMatch[0]);
      
      logger.info('Content piece optimized successfully');
      return optimization;

    } catch (error) {
      logger.error('Error optimizing content piece:', {
        error: error.message,
        targetKeywords,
        stack: error.stack
      });
      throw new Error(`Failed to optimize content piece: ${error.message}`);
    }
  }

  async generateTechnicalSEOAudit(websiteUrl, keywordFocus) {
    try {
      logger.info(`Generating technical SEO audit for ${websiteUrl}`);

      const prompt = this._buildTechnicalAuditPrompt(websiteUrl, keywordFocus);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 3000,
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0].text;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in technical audit response');
      }

      const audit = JSON.parse(jsonMatch[0]);
      
      logger.info('Technical SEO audit generated successfully');
      return audit;

    } catch (error) {
      logger.error('Error generating technical SEO audit:', {
        error: error.message,
        websiteUrl,
        stack: error.stack
      });
      throw new Error(`Failed to generate technical SEO audit: ${error.message}`);
    }
  }

  _buildSEOStrategyPrompt(keywordData, competitiveData, websiteUrl) {
    const keywords = keywordData.map(k => `${k.keyword} (${k.searchVolume} vol, ${k.difficulty} diff)`).join('\n');
    const gaps = competitiveData.gapAnalysis?.contentGaps?.map(g => g.opportunity).join(', ') || 'No gap data';

    return `
As an expert SEO strategist, create a comprehensive SEO strategy for ${websiteUrl} based on this data:

KEYWORD DATA:
${keywords}

COMPETITIVE GAPS:
${gaps}

Create a detailed strategy with these components:

1. EXECUTIVE SUMMARY
- Key opportunities and prioritization
- Expected timeline and results
- Resource requirements

2. KEYWORD STRATEGY
- Primary vs secondary keyword targeting
- Keyword clustering and topic themes
- Search intent mapping

3. CONTENT STRATEGY
- Content pillars and themes
- Content calendar recommendations
- Content gap opportunities

4. TECHNICAL SEO PRIORITIES
- Site architecture recommendations
- Page speed and Core Web Vitals
- Mobile optimization priorities

5. COMPETITIVE POSITIONING
- Competitive advantages to leverage
- Weaknesses to exploit
- Market positioning strategy

6. LINK BUILDING STRATEGY
- Target link opportunities
- Content for link attraction
- Outreach strategies

7. MEASUREMENT & KPIS
- Key metrics to track
- Success milestones
- Reporting recommendations

Return as valid JSON with this structure:
{
  "executiveSummary": {
    "keyOpportunities": ["opportunity1", "opportunity2"],
    "timeline": "3-6 months",
    "expectedResults": "description",
    "resourceNeeds": ["need1", "need2"]
  },
  "keywordStrategy": {
    "primaryKeywords": [{"keyword": "term", "priority": "high", "intent": "commercial"}],
    "secondaryKeywords": [{"keyword": "term", "priority": "medium", "intent": "informational"}],
    "keywordClusters": [
      {
        "theme": "cluster name",
        "keywords": ["kw1", "kw2"],
        "contentType": "blog|landing|resource",
        "priority": "high|medium|low"
      }
    ]
  },
  "contentStrategy": {
    "contentPillars": ["pillar1", "pillar2"],
    "monthlyContentPlan": {
      "month1": [{"title": "content title", "keywords": ["kw1"], "type": "blog"}],
      "month2": [{"title": "content title", "keywords": ["kw1"], "type": "landing"}]
    },
    "gapOpportunities": ["opportunity1", "opportunity2"]
  },
  "technicalSEO": {
    "priorities": [
      {
        "item": "priority name",
        "impact": "high|medium|low",
        "effort": "high|medium|low",
        "description": "what needs to be done"
      }
    ],
    "siteArchitecture": "recommendations",
    "performanceOptimization": ["optimization1", "optimization2"]
  },
  "competitiveStrategy": {
    "advantages": ["advantage1", "advantage2"],
    "opportunitiesToExploit": ["opp1", "opp2"],
    "positioning": "how to position in market"
  },
  "linkBuilding": {
    "strategies": ["strategy1", "strategy2"],
    "targetOpportunities": [
      {
        "type": "guest posting|resource page|broken link",
        "priority": "high|medium|low",
        "description": "strategy description"
      }
    ],
    "contentForLinks": ["content idea1", "content idea2"]
  },
  "measurement": {
    "kpis": [
      {
        "metric": "metric name",
        "target": "target value",
        "timeframe": "3 months"
      }
    ],
    "milestones": ["milestone1", "milestone2"],
    "reportingFrequency": "weekly|monthly"
  }
}
`;
  }

  _buildContentRecommendationsPrompt(seoStrategy, keywordClusters) {
    const clusters = keywordClusters.map(c => `${c.theme}: ${c.keywords.join(', ')}`).join('\n');

    return `
Based on this SEO strategy and keyword clusters, create detailed content recommendations:

KEYWORD CLUSTERS:
${clusters}

STRATEGY FOCUS:
${JSON.stringify(seoStrategy.contentStrategy, null, 2)}

Generate a comprehensive content plan with specific, actionable recommendations:

1. CONTENT PIECES - Individual articles/pages
2. CONTENT SERIES - Multi-part content themes
3. RESOURCE PAGES - High-value utility content
4. LANDING PAGES - Commercial intent pages

For each content piece, provide:
- Exact title and headline
- Target keywords and intent
- Content structure/outline
- Estimated word count
- Internal linking opportunities
- CTA recommendations
- Success metrics

Return as valid JSON:
{
  "contentPieces": [
    {
      "id": "unique-id",
      "title": "Exact title",
      "type": "blog|landing|resource|guide",
      "priority": "high|medium|low",
      "targetKeywords": {
        "primary": "main keyword",
        "secondary": ["keyword1", "keyword2"],
        "longTail": ["long tail keyword"]
      },
      "searchIntent": "informational|commercial|transactional|navigational",
      "estimatedWordCount": 2500,
      "contentOutline": [
        {
          "section": "Introduction",
          "subsections": ["hook", "problem", "solution preview"],
          "keywords": ["keyword1", "keyword2"]
        }
      ],
      "internalLinks": [
        {
          "linkTo": "target page",
          "anchorText": "anchor text",
          "context": "where to place link"
        }
      ],
      "callToAction": {
        "type": "lead magnet|product|service|newsletter",
        "text": "CTA text",
        "placement": "where to place"
      },
      "successMetrics": {
        "primaryKPI": "organic traffic increase",
        "target": "500 monthly visits",
        "timeline": "3 months"
      },
      "competitiveAdvantage": "What makes this unique vs competitors"
    }
  ],
  "contentSeries": [
    {
      "seriesName": "Series title",
      "description": "What the series covers",
      "pieces": ["piece-id-1", "piece-id-2"],
      "crossPromotionStrategy": "How pieces link together"
    }
  ],
  "resourcePages": [
    {
      "title": "Ultimate Resource Title",
      "type": "tool|template|checklist|guide",
      "description": "What value it provides",
      "leadMagnetPotential": "high|medium|low",
      "linkBuildingPotential": "high|medium|low"
    }
  ],
  "landingPages": [
    {
      "title": "Landing page title",
      "targetKeyword": "commercial keyword",
      "conversionGoal": "sign up|purchase|demo",
      "contentStructure": ["headline", "benefits", "social proof", "CTA"],
      "competitorGap": "What competitors don't offer"
    }
  ],
  "implementationPlan": {
    "phase1": {
      "duration": "30 days",
      "focus": "Quick wins",
      "content": ["piece-id-1", "piece-id-2"]
    },
    "phase2": {
      "duration": "60 days", 
      "focus": "Authority building",
      "content": ["piece-id-3", "piece-id-4"]
    }
  }
}
`;
  }

  _buildContentOptimizationPrompt(contentOutline, targetKeywords, competitorAnalysis) {
    return `
Optimize this content outline for SEO and user engagement:

CONTENT OUTLINE:
${JSON.stringify(contentOutline, null, 2)}

TARGET KEYWORDS:
Primary: ${targetKeywords[0]}
Secondary: ${targetKeywords.slice(1).join(', ')}

COMPETITOR ANALYSIS:
${JSON.stringify(competitorAnalysis, null, 2)}

Provide optimization recommendations:

Return as valid JSON:
{
  "optimizedOutline": {
    "seoTitle": "Optimized title with primary keyword",
    "metaDescription": "Compelling 155-char meta description",
    "headingStructure": [
      {
        "level": "H1",
        "text": "Heading text with keyword",
        "keywords": ["keyword1", "keyword2"]
      }
    ],
    "keywordPlacement": {
      "naturalDensity": "2.5%",
      "semanticKeywords": ["related1", "related2"],
      "lsiKeywords": ["lsi1", "lsi2"]
    }
  },
  "contentEnhancements": [
    {
      "type": "section|element|feature",
      "recommendation": "Specific improvement",
      "rationale": "Why this helps SEO/UX",
      "implementation": "How to implement"
    }
  ],
  "competitiveAdvantages": [
    "Unique angle 1",
    "Unique angle 2"
  ],
  "userExperienceOptimizations": [
    {
      "element": "readability|navigation|engagement",
      "improvement": "Specific enhancement",
      "impact": "Expected UX benefit"
    }
  ],
  "technicalSEOElements": {
    "schemaMarkup": "Recommended schema type",
    "imageOptimization": "Alt text and file naming strategy",
    "internalLinking": "Linking strategy within content"
  }
}
`;
  }

  _buildTechnicalAuditPrompt(websiteUrl, keywordFocus) {
    return `
Generate a technical SEO audit framework for ${websiteUrl} focusing on keywords: ${keywordFocus.join(', ')}

Create a comprehensive audit checklist and recommendations:

Return as valid JSON:
{
  "auditAreas": {
    "crawlability": {
      "checks": ["robots.txt", "sitemap.xml", "internal linking"],
      "priorities": ["critical", "important", "nice-to-have"],
      "recommendations": ["specific action items"]
    },
    "pageSpeed": {
      "coreWebVitals": {
        "LCP": "target < 2.5s",
        "FID": "target < 100ms", 
        "CLS": "target < 0.1"
      },
      "optimizations": ["compress images", "minify CSS/JS"],
      "mobileOptimization": ["viewport", "touch targets"]
    },
    "onPageSEO": {
      "titleTags": "optimization guidelines",
      "metaDescriptions": "best practices",
      "headingStructure": "H1-H6 hierarchy",
      "keywordOptimization": "density and placement"
    },
    "technicalStructure": {
      "urlStructure": "SEO-friendly URL guidelines",
      "breadcrumbNavigation": "implementation recommendations",
      "internalLinking": "strategy and best practices",
      "schemaMarkup": "structured data recommendations"
    }
  },
  "prioritizedActions": [
    {
      "action": "Specific technical fix",
      "priority": "critical|high|medium|low",
      "impact": "Expected SEO benefit",
      "effort": "Implementation difficulty",
      "timeline": "Recommended completion time"
    }
  ],
  "monitoringSetup": {
    "tools": ["Google Search Console", "PageSpeed Insights"],
    "kpis": ["Core Web Vitals", "crawl errors"],
    "alerts": ["performance degradation", "indexing issues"]
  }
}
`;
  }

  async healthCheck() {
    try {
      // Simple test message to verify API connectivity
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Reply with just "OK" to confirm the API is working.'
          }
        ]
      });

      return {
        status: 'healthy',
        model: this.model,
        responseLength: response.content[0].text.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Claude health check failed:', error.message);
      throw new Error(`Claude API health check failed: ${error.message}`);
    }
  }
}

export default ClaudeService;