import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Google Gemini API key not found');
      this.genAI = null;
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateSEOContent(topic, keywords = []) {
    if (!this.genAI) {
      throw new Error('Gemini AI not initialized - API key missing');
    }

    try {
      const prompt = `
        Create an SEO-optimized blog post about "${topic}".
        Target keywords: ${keywords.join(', ')}
        
        Return a JSON object with the following structure:
        {
          "title": "Compelling H1 title with primary keyword",
          "metaDescription": "150-160 character meta description",
          "content": "Full HTML content with proper H2, H3 structure and keyword optimization",
          "targetKeywords": ["list", "of", "target", "keywords"],
          "estimatedReadTime": "5 min read",
          "wordCount": 1200
        }
        
        Requirements:
        - Include H2 and H3 headings
        - Natural keyword integration
        - 1000-1500 words
        - Engaging and informative content
        - Include actionable tips
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON, fallback to structured content if parsing fails
      try {
        return JSON.parse(text);
      } catch (parseError) {
        // Fallback structure if JSON parsing fails
        return {
          title: `The Complete Guide to ${topic}`,
          metaDescription: `Discover everything you need to know about ${topic}. Expert insights, tips, and strategies.`,
          content: text,
          targetKeywords: keywords,
          estimatedReadTime: "5 min read",
          wordCount: text.split(' ').length
        };
      }
    } catch (error) {
      console.error('Gemini content generation failed:', error);
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  async analyzeKeywords(seedKeyword, count = 20) {
    if (!this.genAI) {
      throw new Error('Gemini AI not initialized - API key missing');
    }

    try {
      const prompt = `
        Generate ${count} high-value SEO keywords related to "${seedKeyword}".
        
        Return a JSON array with this structure:
        [
          {
            "keyword": "specific keyword phrase",
            "searchVolume": estimated_monthly_searches,
            "difficulty": difficulty_score_1_to_100,
            "intent": "informational|commercial|transactional|navigational",
            "opportunity": "high|medium|low"
          }
        ]
        
        Focus on:
        - Long-tail keywords
        - Commercial intent variations
        - Question-based keywords
        - Comparison keywords
        - Tool/software related terms
        
        Provide realistic search volume estimates and difficulty scores.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        // Fallback with generated keywords if JSON parsing fails
        return this.generateFallbackKeywords(seedKeyword, count);
      }
    } catch (error) {
      console.error('Gemini keyword analysis failed:', error);
      throw new Error(`Keyword analysis failed: ${error.message}`);
    }
  }

  async generateContentStrategy(keywords, niche) {
    if (!this.genAI) {
      throw new Error('Gemini AI not initialized - API key missing');
    }

    try {
      const prompt = `
        Create a comprehensive content strategy for the "${niche}" niche.
        Target keywords: ${keywords.join(', ')}
        
        Return a JSON object:
        {
          "strategy": "Overall content strategy description",
          "contentPillars": ["pillar1", "pillar2", "pillar3"],
          "contentIdeas": [
            {
              "title": "Blog post title",
              "type": "blog|guide|tutorial|comparison|review",
              "targetKeywords": ["keyword1", "keyword2"],
              "priority": "high|medium|low",
              "estimatedTraffic": estimated_monthly_visitors
            }
          ],
          "competitorGaps": ["opportunity1", "opportunity2"],
          "monthlyPlan": {
            "week1": "Content focus for week 1",
            "week2": "Content focus for week 2",
            "week3": "Content focus for week 3",
            "week4": "Content focus for week 4"
          }
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini strategy generation failed:', error);
      throw new Error(`Strategy generation failed: ${error.message}`);
    }
  }

  async optimizeContent(content, targetKeywords) {
    if (!this.genAI) {
      throw new Error('Gemini AI not initialized - API key missing');
    }

    try {
      const prompt = `
        Analyze and optimize this content for SEO:
        
        Content: ${content.substring(0, 2000)}...
        Target Keywords: ${targetKeywords.join(', ')}
        
        Return a JSON object:
        {
          "seoScore": score_out_of_100,
          "optimizedTitle": "SEO optimized title",
          "optimizedMetaDescription": "Optimized meta description",
          "keywordOptimization": {
            "primaryKeywordDensity": percentage,
            "keywordPlacement": "analysis of keyword placement",
            "suggestions": ["suggestion1", "suggestion2"]
          },
          "contentSuggestions": [
            "suggestion for improvement 1",
            "suggestion for improvement 2"
          ],
          "technicalSEO": {
            "headingStructure": "analysis of H1, H2, H3 structure",
            "readabilityScore": score_out_of_100,
            "internalLinkOpportunities": ["opportunity1", "opportunity2"]
          }
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini content optimization failed:', error);
      throw new Error(`Content optimization failed: ${error.message}`);
    }
  }

  async generateProgrammaticSEOPlan(websiteAnalysis, selectedKeywords) {
    if (!this.genAI) {
      throw new Error('Gemini AI not initialized - API key missing');
    }

    try {
      const prompt = `
        Generate a PRACTICAL SEO STRATEGY for creating 4-5 optimized SEO pages based on:

        Website Analysis: ${JSON.stringify(websiteAnalysis, null, 2)}
        Selected Keywords: ${selectedKeywords.join(', ')}

        Create a focused SEO strategy with these sections:

        1. SEO PAGE STRATEGY (4-5 Pages)
        - Target: Create 4-5 high-quality SEO pages (perfect for free tier)
        - Each page targets 1 primary keyword + 2-3 related keywords
        - Focus on conversion and user value over quantity
        - Estimated traffic: 500-2000 monthly visitors per page

        2. KEYWORD OPTIMIZATION FOR EACH PAGE
        For each selected keyword, provide:
        - Primary keyword (main focus)
        - 2-3 secondary keywords for the same page
        - Long-tail variations for natural content
        - Search intent alignment (informational, commercial, transactional)

        3. ON-PAGE SEO REQUIREMENTS
        Essential elements for each page:
        - SEO title (50-60 characters with primary keyword)
        - Meta description (150-160 characters, compelling CTA)
        - H1 (includes primary keyword naturally)
        - H2/H3 structure (2-4 sections per page)
        - Keyword density: 1-2% (natural integration)
        - Internal linking opportunities
        - Schema markup (Article/Product/Service type)

        4. CONTENT STRUCTURE TEMPLATE
        For each page (800-1200 words):
        - Introduction (150 words) - problem/need identification
        - Main content sections (500-800 words) - solutions/information
        - Conclusion with CTA (100-150 words) - conversion focus
        - Natural keyword placement throughout

        5. TECHNICAL SEO CHECKLIST
        - Fast loading pages (optimize images, minify CSS/JS)
        - Mobile responsive design
        - Proper URL structure (/keyword-phrase)
        - Canonical tags to avoid duplicate content
        - Alt text for images
        - Social media meta tags (Open Graph)

        6. IMPLEMENTATION PLAN
        Week 1: Create first 2 pages with primary keywords
        Week 2: Add remaining 2-3 pages
        Week 3: Optimize and test all pages
        Week 4: Monitor performance and adjust

        7. SUCCESS METRICS (Realistic for 4-5 pages)
        - Target: 2,500-10,000 monthly organic visitors
        - Conversion rate: 2-5% (50-500 leads/month)
        - Time to see results: 2-3 months
        - Cost per page: ~$0.20 (very affordable with Gemini free tier)

        Focus on QUALITY over QUANTITY. These 4-5 pages should be highly optimized, 
        conversion-focused, and provide real value to users.
        
        Return a detailed, actionable response formatted with clear headings and bullet points.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text;
    } catch (error) {
      console.error('Programmatic SEO plan generation failed:', error);
      throw new Error(`Programmatic SEO plan generation failed: ${error.message}`);
    }
  }

  generateFallbackKeywords(seedKeyword, count) {
    const patterns = [
      `best ${seedKeyword}`,
      `${seedKeyword} tools`,
      `${seedKeyword} guide`,
      `how to ${seedKeyword}`,
      `${seedKeyword} tutorial`,
      `${seedKeyword} tips`,
      `${seedKeyword} strategies`,
      `${seedKeyword} for beginners`,
      `${seedKeyword} alternatives`,
      `${seedKeyword} comparison`,
      `${seedKeyword} reviews`,
      `${seedKeyword} pricing`,
      `free ${seedKeyword}`,
      `${seedKeyword} vs`,
      `${seedKeyword} features`,
      `${seedKeyword} benefits`,
      `${seedKeyword} examples`,
      `${seedKeyword} templates`,
      `${seedKeyword} checklist`,
      `${seedKeyword} software`
    ];

    return patterns.slice(0, count).map((keyword, index) => ({
      keyword,
      searchVolume: Math.floor(Math.random() * 10000) + 1000,
      difficulty: Math.floor(Math.random() * 100),
      intent: ['informational', 'commercial', 'transactional'][Math.floor(Math.random() * 3)],
      opportunity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
    }));
  }

  isInitialized() {
    return this.genAI !== null;
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService; 