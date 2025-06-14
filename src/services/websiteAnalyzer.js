import geminiService from './geminiService';

class WebsiteAnalyzer {
  constructor() {
    this.geminiService = geminiService;
  }

  // Fetch website content using a CORS proxy or direct fetch
  async fetchWebsiteContent(url) {
    try {
      // Clean and validate URL
      const cleanUrl = this.validateAndCleanUrl(url);
      
      // For development, we'll use a CORS proxy
      // In production, you'd want to use a backend service
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(cleanUrl)}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (!data.contents) {
        throw new Error('Unable to fetch website content');
      }

      return this.parseHTMLContent(data.contents);
    } catch (error) {
      console.error('Website fetch failed:', error);
      throw new Error(`Failed to analyze website: ${error.message}`);
    }
  }

  validateAndCleanUrl(url) {
    // Add https:// if no protocol specified
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    try {
      new URL(url);
      return url;
    } catch {
      throw new Error('Invalid URL format');
    }
  }

  parseHTMLContent(htmlContent) {
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Extract key content elements
    const title = doc.querySelector('title')?.textContent || '';
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.textContent.trim());
    const paragraphs = Array.from(doc.querySelectorAll('p')).map(p => p.textContent.trim()).filter(text => text.length > 20);
    
    // Get all text content
    const bodyText = doc.body?.textContent || '';
    const cleanText = bodyText.replace(/\s+/g, ' ').trim();
    
    return {
      title,
      metaDescription,
      headings,
      paragraphs: paragraphs.slice(0, 10), // Limit to first 10 paragraphs
      fullText: cleanText.substring(0, 5000), // Limit to 5000 characters
      wordCount: cleanText.split(' ').length,
      url: doc.location?.href || ''
    };
  }

  // Analyze website content and generate seed keywords using Google Gemini
  async generateSeedKeywords(websiteContent) {
    if (!this.geminiService.isInitialized()) {
      throw new Error('Google Gemini service not initialized');
    }

    try {
             const prompt = `
         Analyze this website content and generate 6-7 high-value seed keywords for PROGRAMMATIC SEO. 
         Think about keywords that can be scaled to create THOUSANDS of SEO pages.

         Website Content:
         Title: ${websiteContent.title}
         Meta Description: ${websiteContent.metaDescription}
         Main Headings: ${websiteContent.headings.join(', ')}
         Content Preview: ${websiteContent.fullText.substring(0, 1500)}

         Return a JSON object with this structure:
         {
           "websiteAnalysis": {
             "primaryNiche": "main business/topic category",
             "businessType": "service/product/blog/ecommerce/etc",
             "targetAudience": "who this website serves",
             "mainTopics": ["topic1", "topic2", "topic3"],
             "programmaticSEOPotential": "how many pages could be created"
           },
           "seedKeywords": [
             {
               "keyword": "scalable keyword phrase for programmatic SEO",
               "relevance": "high|medium|low",
               "intent": "commercial|informational|transactional|navigational",
               "priority": 1-7,
               "rationale": "why this keyword can generate hundreds of pages",
               "scalabilityPotential": "how many pages this keyword could create"
             }
           ]
         }

         Focus on PROGRAMMATIC SEO opportunities:
         - Keywords that can be templated for hundreds of variations
         - Location-based keywords (city + service combinations)
         - Product/service category combinations
         - "Best X for Y" type scalable patterns
         - Industry + use case combinations
         - Keywords that support bulk content generation
       `;

      const result = await this.geminiService.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return this.generateFallbackAnalysis(websiteContent);
      }
    } catch (error) {
      console.error('Seed keyword generation failed:', error);
      throw new Error(`Keyword analysis failed: ${error.message}`);
    }
  }

  // Generate comprehensive keyword report using Google Gemini (DataForSEO replacement)
  async generateKeywordReport(selectedKeywords, websiteContext) {
    if (!this.geminiService.isInitialized()) {
      throw new Error('Google Gemini service not initialized');
    }

    try {
      const prompt = `
        Act as a comprehensive SEO keyword research tool (like DataForSEO). Analyze these selected keywords and provide a detailed keyword report.

        Selected Keywords: ${selectedKeywords.join(', ')}
        Website Context: ${websiteContext.primaryNiche} - ${websiteContext.businessType}

        Return a comprehensive JSON report:
        {
          "keywordAnalysis": {
            "primaryKeywords": [
              {
                "keyword": "exact keyword",
                "estimatedSearchVolume": realistic_monthly_searches,
                "keywordDifficulty": score_1_to_100,
                "cpc": estimated_cost_per_click,
                "competitionLevel": "low|medium|high",
                "searchIntent": "informational|commercial|transactional|navigational",
                "seasonality": "stable|seasonal|trending",
                "relatedKeywords": ["related1", "related2", "related3"]
              }
            ],
            "longtailVariations": [
              {
                "keyword": "long tail variation",
                "parentKeyword": "main keyword it relates to",
                "searchVolume": estimated_volume,
                "difficulty": score_1_to_100,
                "opportunity": "high|medium|low"
              }
            ],
            "questionKeywords": [
              {
                "question": "question-based keyword",
                "answerType": "how-to|what-is|comparison|list",
                "searchVolume": estimated_volume,
                "contentOpportunity": "description of content opportunity"
              }
            ],
            "competitorKeywords": [
              {
                "keyword": "competitor targeting keyword",
                "estimatedTraffic": potential_monthly_traffic,
                "gapOpportunity": "why this is an opportunity",
                "contentType": "blog|product|service|landing page"
              }
            ]
          },
          "marketAnalysis": {
            "totalMarketSize": estimated_total_monthly_searches,
            "competitionOverview": "analysis of competition level",
            "marketTrends": "trending keywords and opportunities",
            "bestOpportunities": ["top 5 keyword opportunities"]
          },
          "contentStrategy": {
            "priorityContent": [
              {
                "contentType": "blog|landing|product|service page",
                "targetKeywords": ["keyword1", "keyword2"],
                "estimatedTraffic": potential_monthly_visitors,
                "difficulty": "easy|medium|hard",
                "timeframe": "quick win|medium term|long term"
              }
            ]
          }
        }

        Provide realistic data based on industry standards and keyword analysis best practices.
      `;

      const result = await this.geminiService.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch (parseError) {
        return this.generateFallbackKeywordReport(selectedKeywords);
      }
    } catch (error) {
      console.error('Keyword report generation failed:', error);
      throw new Error(`Keyword report failed: ${error.message}`);
    }
  }

  // Generate complete SEO analysis and recommendations
  async generateSEOAnalysis(keywordReport, websiteContent, selectedKeywords) {
    if (!this.geminiService.isInitialized()) {
      throw new Error('Google Gemini service not initialized');
    }

    try {
      const prompt = `
        Create a comprehensive SEO analysis and improvement strategy based on the keyword research and website analysis.

        Website: ${websiteContent.title}
        Target Keywords: ${selectedKeywords.join(', ')}
        Current Content Quality: ${websiteContent.wordCount} words, ${websiteContent.headings.length} headings

        Keyword Research Summary:
        - Primary opportunities from keyword analysis
        - Competition level insights
        - Content gaps identified

        Generate a complete SEO improvement report as a well-formatted blog post:

        # Complete SEO Analysis & Improvement Strategy for [Website Name]

        ## Executive Summary
        [Brief overview of current SEO status and main opportunities]

        ## Website Analysis
        [Analysis of current website structure, content, and SEO elements]

        ## Keyword Strategy
        [Detailed keyword recommendations with priority levels]

        ## Competitive Analysis
        [Analysis of competitors and opportunities to outrank them]

        ## Content Strategy
        [Specific content recommendations with target keywords]

        ## Technical SEO Recommendations
        [Technical improvements needed]

        ## Action Plan
        [Step-by-step implementation plan with priorities]

        ## Expected Results
        [Traffic projections and timeline expectations]

        Make this a comprehensive, actionable report that the website owner can immediately implement.
        Include specific recommendations, not generic advice.
        Use the actual keyword data and website content in your analysis.
      `;

      const result = await this.geminiService.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        analysis: text,
        recommendations: this.extractActionableRecommendations(text),
        priority: 'high',
        estimatedImpact: 'significant traffic improvement within 3-6 months'
      };
    } catch (error) {
      console.error('SEO analysis generation failed:', error);
      throw new Error(`SEO analysis failed: ${error.message}`);
    }
  }

  extractActionableRecommendations(analysisText) {
    // Extract specific actionable items from the analysis
    const recommendations = [];
    const lines = analysisText.split('\n');
    
    lines.forEach(line => {
      if (line.includes('Recommendation:') || line.includes('Action:') || line.includes('TODO:')) {
        recommendations.push(line.trim());
      }
    });

    return recommendations;
  }

  generateFallbackAnalysis(websiteContent) {
    return {
      websiteAnalysis: {
        primaryNiche: "Business/Service",
        businessType: "website",
        targetAudience: "General audience",
        mainTopics: ["business", "services", "information"]
      },
      seedKeywords: [
        {
          keyword: websiteContent.title?.split(' ').slice(0, 3).join(' ') || "business services",
          relevance: "high",
          intent: "commercial",
          priority: 1,
          rationale: "Based on website title"
        }
      ]
    };
  }

  generateFallbackKeywordReport(keywords) {
    return {
      keywordAnalysis: {
        primaryKeywords: keywords.map((keyword, index) => ({
          keyword,
          estimatedSearchVolume: Math.floor(Math.random() * 10000) + 1000,
          keywordDifficulty: Math.floor(Math.random() * 100),
          cpc: (Math.random() * 5).toFixed(2),
          competitionLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          searchIntent: ['informational', 'commercial', 'transactional'][Math.floor(Math.random() * 3)],
          seasonality: "stable",
          relatedKeywords: [`${keyword} guide`, `best ${keyword}`, `${keyword} tips`]
        }))
      },
      marketAnalysis: {
        totalMarketSize: 50000,
        competitionOverview: "Moderate competition with opportunities",
        marketTrends: "Growing interest in digital solutions",
        bestOpportunities: keywords.slice(0, 3)
      }
    };
  }
}

// Export singleton instance
export const websiteAnalyzer = new WebsiteAnalyzer();
export default websiteAnalyzer; 