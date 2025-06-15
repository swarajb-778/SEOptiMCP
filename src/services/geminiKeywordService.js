import { geminiService } from './geminiService';

class GeminiKeywordService {
  constructor() {
    this.maxKeywords = 50;
    this.retryAttempts = 3;
  }

  /**
   * Expand seed keywords into comprehensive keyword list using advanced prompting
   */
  async expandKeywords(seedKeywords, websiteAnalysis) {
    if (!Array.isArray(seedKeywords) || seedKeywords.length === 0) {
      throw new Error('Valid seed keywords array required');
    }

    if (!geminiService.isInitialized()) {
      throw new Error('Gemini service not initialized');
    }

    const businessContext = this.createBusinessContext(websiteAnalysis);
    
    const prompt = `
You are a senior SEO specialist with 15 years of experience in keyword research and competitive analysis.

SEED KEYWORDS: ${seedKeywords.join(', ')}

BUSINESS CONTEXT:
${businessContext}

TASK: Generate a comprehensive keyword expansion using advanced SEO methodology.

GENERATE EXACTLY 50 KEYWORDS ACROSS THESE CATEGORIES:

1. HIGH-COMMERCIAL INTENT KEYWORDS (15 keywords)
   - "buy [product]", "[service] near me", "best [product] 2024"
   - Include price-related, comparison, and purchase intent terms

2. LONG-TAIL OPPORTUNITIES (15 keywords)
   - 4-6 word phrases with lower competition
   - Specific problem-solving queries
   - How-to and tutorial variations

3. QUESTION-BASED KEYWORDS (10 keywords)
   - "How to...", "What is...", "Why does...", "When to..."
   - FAQ-style queries your audience asks

4. COMPARISON KEYWORDS (10 keywords)
   - "X vs Y", "X alternatives", "best X compared"
   - Competitive comparison terms

FOR EACH KEYWORD, PROVIDE:
- Estimated monthly search volume (realistic based on industry norms)
- Competition level (1-10, where 10 = highest competition)
- Commercial intent score (1-10, where 10 = highest buying intent)
- Content angle (brief suggestion for content approach)
- Keyword difficulty (1-10, based on SERP analysis)

RETURN AS VALID JSON:
{
  "expandedKeywords": [
    {
      "keyword": "exact keyword phrase",
      "category": "commercial|long-tail|question|comparison",
      "searchVolume": number,
      "competition": number,
      "commercialIntent": number,
      "difficulty": number,
      "contentAngle": "brief content suggestion",
      "opportunity": "low|medium|high"
    }
  ],
  "summary": {
    "totalKeywords": 50,
    "highOpportunity": number,
    "avgSearchVolume": number,
    "topRecommendations": ["top 5 keyword phrases"]
  }
}

Focus on realistic, achievable keywords that match the business model and audience needs.
`;

    try {
      const response = await geminiService.generateContent(prompt);
      return this.parseKeywordResponse(response);
    } catch (error) {
      console.error('Keyword expansion failed:', error);
      return this.createFallbackKeywords(seedKeywords, websiteAnalysis);
    }
  }

  /**
   * Analyze competition for given keywords using SERP simulation
   */
  async analyzeCompetition(keywords, websiteAnalysis) {
    if (!Array.isArray(keywords) || keywords.length === 0) {
      throw new Error('Valid keywords array required');
    }

    const topKeywords = keywords.slice(0, 10); // Limit for performance
    const businessContext = this.createBusinessContext(websiteAnalysis);

    const prompt = `
You are a competitive intelligence analyst specializing in SEO and SERP analysis.

TARGET KEYWORDS: ${topKeywords.join(', ')}

BUSINESS CONTEXT:
${businessContext}

TASK: Simulate Google SERP analysis and identify competitive opportunities.

ANALYZE THE COMPETITIVE LANDSCAPE:

1. SERP FEATURE SIMULATION
   For each keyword, predict what appears in Google results:
   - Featured snippets (yes/no and type)
   - Local pack (yes/no)
   - Shopping results (yes/no)
   - Images/videos (yes/no)
   - People also ask (yes/no)

2. COMPETITOR CONTENT PATTERNS
   - Typical content length for ranking pages
   - Common content formats (guides, lists, reviews)
   - Authority level of competing domains
   - Content gaps in current top results

3. RANKING OPPORTUNITIES
   - Keywords with weak competition
   - Content angles competitors miss
   - SERP features we can target
   - Underserved search intents

4. POSITIONING STRATEGY
   - Unique value propositions we can emphasize
   - Content differentiation opportunities
   - Target audience segments competitors ignore

RETURN AS VALID JSON:
{
  "competitorAnalysis": [
    {
      "keyword": "keyword phrase",
      "serpFeatures": {
        "featuredSnippet": boolean,
        "localPack": boolean,
        "shopping": boolean,
        "images": boolean,
        "peopleAlsoAsk": boolean
      },
      "competitionLevel": "low|medium|high",
      "contentLength": "average word count",
      "contentType": "primary content format",
      "opportunityScore": number,
      "recommendations": "specific action items"
    }
  ],
  "overallInsights": {
    "bestOpportunities": ["top 3 keywords"],
    "contentGaps": ["gap 1", "gap 2", "gap 3"],
    "positioningAdvice": "strategic positioning recommendation",
    "quickWins": ["immediate opportunity 1", "immediate opportunity 2"]
  }
}

Base analysis on current SEO best practices and SERP patterns.
`;

    try {
      const response = await geminiService.generateContent(prompt);
      return this.parseCompetitionResponse(response);
    } catch (error) {
      console.error('Competition analysis failed:', error);
      return this.createFallbackCompetition(keywords);
    }
  }

  /**
   * Generate comprehensive SEO strategy using all analysis data
   */
  async createMasterStrategy(keywordData, competitionData, websiteAnalysis) {
    const businessContext = this.createBusinessContext(websiteAnalysis);
    const topKeywords = keywordData.expandedKeywords?.slice(0, 10) || [];

    const prompt = `
You are a senior SEO strategist creating a comprehensive 12-month SEO implementation plan.

KEYWORD RESEARCH DATA:
${JSON.stringify(keywordData.summary || {}, null, 2)}

COMPETITION ANALYSIS:
${JSON.stringify(competitionData.overallInsights || {}, null, 2)}

BUSINESS CONTEXT:
${businessContext}

TOP KEYWORDS: ${topKeywords.map(k => k.keyword).join(', ')}

CREATE A COMPREHENSIVE SEO MASTER STRATEGY:

1. EXECUTIVE SUMMARY
   - Current SEO health assessment (1-100)
   - Top 3 strategic opportunities
   - Expected traffic increase percentage
   - Timeline to see results
   - ROI projections

2. KEYWORD STRATEGY
   - Primary keywords (5 main targets)
   - Secondary keywords (15 supporting terms)
   - Long-tail opportunities (20 easy wins)
   - Content cluster organization
   - Keyword priority matrix

3. CONTENT STRATEGY (12-MONTH PLAN)
   - Blog content calendar (48 blog posts)
   - Landing page opportunities (8-10 pages)
   - Resource/tool pages (5 high-value pages)
   - Video content suggestions (12 videos)
   - Content upgrade opportunities

4. TECHNICAL SEO ROADMAP
   - Month 1-3: Foundation & On-page optimization
   - Month 4-6: Content creation & optimization
   - Month 7-9: Authority building & link acquisition
   - Month 10-12: Advanced optimization & scaling

5. IMPLEMENTATION PRIORITIES
   - Quick wins (30-day goals)
   - Medium-term goals (90-day targets)
   - Long-term objectives (12-month vision)
   - Success metrics and KPIs

6. COMPETITIVE POSITIONING
   - Unique value propositions to emphasize
   - Content differentiation strategy
   - Market positioning recommendations
   - Competitive advantage areas

7. PERFORMANCE PROJECTIONS
   - Monthly traffic growth estimates
   - Conversion rate improvement potential
   - Revenue impact calculations
   - Investment requirements

RETURN AS VALID JSON:
{
  "executiveSummary": {
    "currentScore": number,
    "topOpportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
    "trafficIncrease": "percentage estimate",
    "timelineToResults": "months",
    "projectedROI": "ROI estimate"
  },
  "keywordStrategy": {
    "primaryKeywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"],
    "secondaryKeywords": ["array of 15 keywords"],
    "longTailKeywords": ["array of 20 keywords"],
    "contentClusters": [
      {
        "clusterTopic": "topic name",
        "pillarPage": "main page title",
        "supportingContent": ["supporting page 1", "supporting page 2"]
      }
    ]
  },
  "contentStrategy": {
    "blogCalendar": [
      {
        "month": "January",
        "posts": ["post title 1", "post title 2", "post title 3", "post title 4"]
      }
    ],
    "landingPages": ["page 1", "page 2"],
    "resourcePages": ["resource 1", "resource 2"],
    "videoContent": ["video 1", "video 2"]
  },
  "implementationRoadmap": {
    "month1to3": ["task 1", "task 2", "task 3"],
    "month4to6": ["task 1", "task 2", "task 3"],
    "month7to9": ["task 1", "task 2", "task 3"],
    "month10to12": ["task 1", "task 2", "task 3"]
  },
  "successMetrics": {
    "trafficTargets": "monthly targets",
    "rankingGoals": "ranking improvements",
    "conversionGoals": "conversion improvements",
    "revenueTargets": "revenue projections"
  }
}

Make all recommendations specific, actionable, and realistic for the business context.
`;

    try {
      const response = await geminiService.generateContent(prompt);
      return this.parseStrategyResponse(response);
    } catch (error) {
      console.error('Strategy creation failed:', error);
      return this.createFallbackStrategy(keywordData, websiteAnalysis);
    }
  }

  /**
   * Create business context from website analysis
   */
  createBusinessContext(websiteAnalysis) {
    if (!websiteAnalysis) {
      return 'General business website requiring SEO optimization';
    }

    return `
BUSINESS TYPE: ${websiteAnalysis.businessType || 'Not specified'}
PRIMARY NICHE: ${websiteAnalysis.primaryNiche || 'Not specified'}
TARGET AUDIENCE: ${websiteAnalysis.targetAudience || 'Not specified'}
BUSINESS MODEL: ${websiteAnalysis.businessModel || 'Not specified'}
VALUE PROPOSITION: ${websiteAnalysis.valueProposition || 'Not specified'}
LOCATION: ${websiteAnalysis.location || 'Not specified'}
COMPANY SIZE: ${websiteAnalysis.companySize || 'Not specified'}
    `.trim();
  }

  /**
   * Parse Gemini response for keyword expansion
   */
  parseKeywordResponse(response) {
    try {
      // Clean the response and parse JSON
      const cleanResponse = this.cleanGeminiResponse(response);
      const parsed = JSON.parse(cleanResponse);
      
      if (parsed.expandedKeywords && Array.isArray(parsed.expandedKeywords)) {
        return parsed;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Failed to parse keyword response:', error);
      return this.createEmptyKeywordResponse();
    }
  }

  /**
   * Parse competition analysis response
   */
  parseCompetitionResponse(response) {
    try {
      const cleanResponse = this.cleanGeminiResponse(response);
      const parsed = JSON.parse(cleanResponse);
      
      if (parsed.competitorAnalysis) {
        return parsed;
      }
      
      throw new Error('Invalid competition response format');
    } catch (error) {
      console.error('Failed to parse competition response:', error);
      return this.createEmptyCompetitionResponse();
    }
  }

  /**
   * Parse strategy response
   */
  parseStrategyResponse(response) {
    try {
      const cleanResponse = this.cleanGeminiResponse(response);
      const parsed = JSON.parse(cleanResponse);
      
      if (parsed.executiveSummary) {
        return parsed;
      }
      
      throw new Error('Invalid strategy response format');
    } catch (error) {
      console.error('Failed to parse strategy response:', error);
      return this.createEmptyStrategyResponse();
    }
  }

  /**
   * Clean Gemini response to extract JSON
   */
  cleanGeminiResponse(response) {
    if (typeof response !== 'string') {
      response = JSON.stringify(response);
    }

    // Remove markdown code blocks
    response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON content between braces
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    
    return response;
  }

  /**
   * Create fallback keyword response
   */
  createFallbackKeywords(seedKeywords, websiteAnalysis) {
    const fallbackKeywords = [];
    const businessType = websiteAnalysis?.businessType || 'business';

    seedKeywords.forEach(seed => {
      // Generate basic variations
      fallbackKeywords.push(
        {
          keyword: seed,
          category: 'commercial',
          searchVolume: 1000,
          competition: 5,
          commercialIntent: 7,
          difficulty: 6,
          contentAngle: `Create comprehensive guide about ${seed}`,
          opportunity: 'medium'
        },
        {
          keyword: `best ${seed}`,
          category: 'commercial',
          searchVolume: 800,
          competition: 7,
          commercialIntent: 9,
          difficulty: 8,
          contentAngle: `Review and comparison of top ${seed} options`,
          opportunity: 'high'
        },
        {
          keyword: `how to ${seed}`,
          category: 'question',
          searchVolume: 600,
          competition: 4,
          commercialIntent: 5,
          difficulty: 4,
          contentAngle: `Step-by-step tutorial for ${seed}`,
          opportunity: 'high'
        }
      );
    });

    return {
      expandedKeywords: fallbackKeywords.slice(0, 30),
      summary: {
        totalKeywords: fallbackKeywords.length,
        highOpportunity: 10,
        avgSearchVolume: 750,
        topRecommendations: fallbackKeywords.slice(0, 5).map(k => k.keyword)
      }
    };
  }

  /**
   * Create fallback competition analysis
   */
  createFallbackCompetition(keywords) {
    const topKeywords = keywords.slice(0, 5);
    
    return {
      competitorAnalysis: topKeywords.map(keyword => ({
        keyword: keyword,
        serpFeatures: {
          featuredSnippet: false,
          localPack: false,
          shopping: false,
          images: true,
          peopleAlsoAsk: true
        },
        competitionLevel: 'medium',
        contentLength: '1500-2000 words',
        contentType: 'comprehensive guide',
        opportunityScore: 7,
        recommendations: `Create detailed, well-structured content targeting "${keyword}"`
      })),
      overallInsights: {
        bestOpportunities: topKeywords.slice(0, 3),
        contentGaps: ['Lack of comprehensive guides', 'Missing video content', 'Limited FAQ coverage'],
        positioningAdvice: 'Focus on creating high-quality, comprehensive content that provides more value than competitors',
        quickWins: ['Optimize meta tags', 'Add FAQ sections', 'Improve page loading speed']
      }
    };
  }

  /**
   * Create fallback strategy
   */
  createFallbackStrategy(keywordData, websiteAnalysis) {
    const businessType = websiteAnalysis?.businessType || 'business';
    
    return {
      executiveSummary: {
        currentScore: 65,
        topOpportunities: ['Content optimization', 'Keyword targeting', 'Technical SEO improvements'],
        trafficIncrease: '150-300%',
        timelineToResults: '3-6 months',
        projectedROI: '300-500%'
      },
      keywordStrategy: {
        primaryKeywords: keywordData.summary?.topRecommendations?.slice(0, 5) || ['primary keyword'],
        secondaryKeywords: keywordData.expandedKeywords?.slice(0, 15).map(k => k.keyword) || [],
        longTailKeywords: keywordData.expandedKeywords?.slice(15, 35).map(k => k.keyword) || [],
        contentClusters: [
          {
            clusterTopic: `${businessType} Solutions`,
            pillarPage: `Complete ${businessType} Guide`,
            supportingContent: [`${businessType} Tips`, `${businessType} Best Practices`]
          }
        ]
      },
      contentStrategy: {
        blogCalendar: [
          { month: 'Month 1', posts: ['Getting Started Guide', 'Best Practices', 'Common Mistakes', 'Expert Tips'] },
          { month: 'Month 2', posts: ['Advanced Techniques', 'Case Studies', 'Tool Reviews', 'Industry Trends'] }
        ],
        landingPages: ['Main Service Page', 'Pricing Page'],
        resourcePages: ['Resource Center', 'FAQ Page'],
        videoContent: ['Introduction Video', 'Tutorial Series']
      },
      implementationRoadmap: {
        month1to3: ['Keyword research', 'On-page optimization', 'Content creation'],
        month4to6: ['Link building', 'Technical improvements', 'Content expansion'],
        month7to9: ['Authority building', 'Advanced optimization', 'Conversion optimization'],
        month10to12: ['Scaling', 'Advanced strategies', 'Performance optimization']
      },
      successMetrics: {
        trafficTargets: '100% increase in 6 months',
        rankingGoals: 'Top 10 for primary keywords',
        conversionGoals: '50% improvement in conversion rate',
        revenueTargets: '200% increase in organic revenue'
      }
    };
  }

  createEmptyKeywordResponse() {
    return {
      expandedKeywords: [],
      summary: {
        totalKeywords: 0,
        highOpportunity: 0,
        avgSearchVolume: 0,
        topRecommendations: []
      }
    };
  }

  createEmptyCompetitionResponse() {
    return {
      competitorAnalysis: [],
      overallInsights: {
        bestOpportunities: [],
        contentGaps: [],
        positioningAdvice: 'Unable to analyze competition at this time',
        quickWins: []
      }
    };
  }

  createEmptyStrategyResponse() {
    return {
      executiveSummary: {
        currentScore: 0,
        topOpportunities: [],
        trafficIncrease: 'Unable to project',
        timelineToResults: 'Unknown',
        projectedROI: 'Unable to calculate'
      },
      keywordStrategy: { primaryKeywords: [], secondaryKeywords: [], longTailKeywords: [], contentClusters: [] },
      contentStrategy: { blogCalendar: [], landingPages: [], resourcePages: [], videoContent: [] },
      implementationRoadmap: { month1to3: [], month4to6: [], month7to9: [], month10to12: [] },
      successMetrics: { trafficTargets: '', rankingGoals: '', conversionGoals: '', revenueTargets: '' }
    };
  }
}

// Export singleton instance
export const geminiKeywordService = new GeminiKeywordService(); 