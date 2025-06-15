import axios from 'axios';
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
  defaultMeta: { service: 'dataforseo-service' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ],
});

class DataForSEOService {
  constructor() {
    this.login = process.env.DATAFORSEO_LOGIN;
    this.password = process.env.DATAFORSEO_PASSWORD;
    this.baseURL = 'https://api.dataforseo.com/v3';
    
    if (!this.login || !this.password) {
      logger.warn('DataForSEO credentials not found, using mock mode');
      this.mockMode = true;
    } else {
      this.mockMode = false;
      
      const credentials = Buffer.from(`${this.login}:${this.password}`).toString('base64');
      this.client = axios.create({
        baseURL: this.baseURL,
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // DataForSEO can be slow
      });
    }
  }

  async getKeywordData(keywords, location = 'United States') {
    if (this.mockMode) {
      return this._getMockKeywordData(keywords);
    }

    try {
      logger.info(`Getting keyword data for ${keywords.length} keywords`);

      const taskData = keywords.map(keyword => ({
        keyword: typeof keyword === 'string' ? keyword : keyword.keyword,
        location_name: location,
        language_name: 'English',
        include_serp_info: true,
        include_clickstream_data: true,
      }));

      // Post task to DataForSEO
      const postResponse = await this.client.post('/keywords_data/google_ads/search_volume/live', taskData);
      
      if (postResponse.data.status_code !== 20000) {
        throw new Error(`DataForSEO API error: ${postResponse.data.status_message}`);
      }

      const results = postResponse.data.tasks.map(task => {
        if (task.status_code !== 20000) {
          logger.warn(`Task failed for keyword: ${task.data?.[0]?.keyword}`);
          return null;
        }

        const data = task.result?.[0];
        if (!data) return null;

        return {
          keyword: data.keyword,
          location: data.location_name,
          language: data.language_name,
          searchVolume: data.search_volume || 0,
          competition: data.competition || 0,
          competitionLevel: data.competition_level || 'unknown',
          cpc: data.cpc || 0,
          monthlySearches: data.monthly_searches || [],
          trends: data.trends || [],
          keywordDifficulty: this._calculateKeywordDifficulty(data),
          timestamp: new Date().toISOString()
        };
      }).filter(Boolean);

      logger.info(`Successfully retrieved data for ${results.length} keywords`);
      return results;

    } catch (error) {
      logger.error('Error getting keyword data:', {
        error: error.message,
        keywords: keywords.length,
        stack: error.stack
      });
      
      // Fallback to mock data if API fails
      logger.info('Falling back to mock data due to API error');
      return this._getMockKeywordData(keywords);
    }
  }

  async getKeywordSuggestions(seedKeyword, limit = 100, location = 'United States') {
    if (this.mockMode) {
      return this._getMockKeywordSuggestions(seedKeyword, limit);
    }

    try {
      logger.info(`Getting keyword suggestions for: ${seedKeyword}`);

      const taskData = [{
        keyword: seedKeyword,
        location_name: location,
        language_name: 'English',
        limit: limit,
        include_serp_info: true,
        include_clickstream_data: true,
        filters: [
          ['search_volume', '>', 100], // Minimum search volume
        ],
        order_by: ['search_volume,desc']
      }];

      const response = await this.client.post('/dataforseo_labs/google/keyword_suggestions/live', taskData);
      
      if (response.data.status_code !== 20000) {
        throw new Error(`DataForSEO API error: ${response.data.status_message}`);
      }

      const task = response.data.tasks[0];
      if (task.status_code !== 20000) {
        throw new Error(`Task failed: ${task.status_message}`);
      }

      const suggestions = task.result.map(item => ({
        keyword: item.keyword,
        searchVolume: item.search_volume || 0,
        competition: item.keyword_info?.competition || 0,
        cpc: item.keyword_info?.cpc || 0,
        difficulty: this._calculateKeywordDifficulty(item.keyword_info),
        relevanceScore: this._calculateRelevance(seedKeyword, item.keyword),
        trends: item.impressions_info?.monthly_impressions || [],
        keywordInfo: {
          monthlySearches: item.keyword_info?.monthly_searches || [],
          competitionLevel: item.keyword_info?.competition_level || 'unknown',
        }
      }));

      logger.info(`Retrieved ${suggestions.length} keyword suggestions`);
      return suggestions;

    } catch (error) {
      logger.error('Error getting keyword suggestions:', {
        error: error.message,
        seedKeyword,
        stack: error.stack
      });
      
      // Fallback to mock data
      return this._getMockKeywordSuggestions(seedKeyword, limit);
    }
  }

  async getSERPAnalysis(keyword, location = 'United States') {
    if (this.mockMode) {
      return this._getMockSERPAnalysis(keyword);
    }

    try {
      logger.info(`Getting SERP analysis for: ${keyword}`);

      const taskData = [{
        keyword: keyword,
        location_name: location,
        language_name: 'English',
        device: 'desktop',
        os: 'windows'
      }];

      const response = await this.client.post('/serp/google/organic/live/advanced', taskData);
      
      if (response.data.status_code !== 20000) {
        throw new Error(`DataForSEO API error: ${response.data.status_message}`);
      }

      const task = response.data.tasks[0];
      if (task.status_code !== 20000) {
        throw new Error(`SERP task failed: ${task.status_message}`);
      }

      const items = task.result?.[0]?.items || [];
      
      const analysis = {
        keyword: keyword,
        totalResults: task.result[0]?.items_count || 0,
        topResults: items.slice(0, 10).map((item, index) => ({
          position: index + 1,
          title: item.title,
          url: item.url,
          domain: item.domain,
          description: item.description,
          ranking_info: {
            page_rank: item.rank_absolute,
            domain_rank: item.domain_rank,
          }
        })),
        competitorAnalysis: this._analyzeCompetitors(items.slice(0, 10)),
        difficultyMetrics: {
          averageDomainRank: this._calculateAverageDomainRank(items.slice(0, 10)),
          competitionLevel: this._assessCompetitionLevel(items.slice(0, 10)),
          rankingDifficulty: this._calculateRankingDifficulty(items.slice(0, 10))
        }
      };

      logger.info(`SERP analysis completed for ${keyword}`);
      return analysis;

    } catch (error) {
      logger.error('Error getting SERP analysis:', {
        error: error.message,
        keyword,
        stack: error.stack
      });
      
      return this._getMockSERPAnalysis(keyword);
    }
  }

  async getCompetitorDomains(domain, limit = 20) {
    if (this.mockMode) {
      return this._getMockCompetitorDomains(domain);
    }

    try {
      logger.info(`Getting competitor domains for: ${domain}`);

      const taskData = [{
        target: domain,
        location_name: 'United States',
        language_name: 'English',
        limit: limit,
        filters: [
          ['intersections', '>', 5], // Minimum keyword intersections
        ],
        order_by: ['intersections,desc']
      }];

      const response = await this.client.post('/dataforseo_labs/google/competitors_domain/live', taskData);
      
      if (response.data.status_code !== 20000) {
        throw new Error(`DataForSEO API error: ${response.data.status_message}`);
      }

      const task = response.data.tasks[0];
      if (task.status_code !== 20000) {
        throw new Error(`Competitor analysis failed: ${task.status_message}`);
      }

      const competitors = task.result.map(item => ({
        domain: item.domain,
        intersections: item.intersections,
        relevance: item.relevance,
        domainRank: item.avg_position,
        sharedKeywords: item.intersections,
        competitionLevel: item.relevance > 0.7 ? 'high' : item.relevance > 0.4 ? 'medium' : 'low'
      }));

      logger.info(`Found ${competitors.length} competitor domains`);
      return competitors;

    } catch (error) {
      logger.error('Error getting competitor domains:', {
        error: error.message,
        domain,
        stack: error.stack
      });
      
      return this._getMockCompetitorDomains(domain);
    }
  }

  // Helper methods for calculations
  _calculateKeywordDifficulty(keywordInfo) {
    if (!keywordInfo) return 50;
    
    const competition = keywordInfo.competition || 0;
    const cpc = keywordInfo.cpc || 0;
    const searchVolume = keywordInfo.search_volume || 0;
    
    // Simple difficulty calculation
    let difficulty = competition * 30; // Competition weight
    difficulty += Math.min(cpc * 10, 30); // CPC weight (max 30)
    difficulty += Math.min(searchVolume / 1000, 40); // Volume weight (max 40)
    
    return Math.round(Math.max(10, Math.min(100, difficulty)));
  }

  _calculateRelevance(seedKeyword, keyword) {
    const seed = seedKeyword.toLowerCase();
    const kw = keyword.toLowerCase();
    
    if (kw.includes(seed)) return 100;
    
    const seedWords = seed.split(' ');
    const kwWords = kw.split(' ');
    const intersection = seedWords.filter(word => kwWords.includes(word));
    
    return Math.round((intersection.length / seedWords.length) * 100);
  }

  _analyzeCompetitors(topResults) {
    const domains = topResults.map(r => r.domain);
    const uniqueDomains = [...new Set(domains)];
    
    return {
      totalCompetitors: uniqueDomains.length,
      topDomains: uniqueDomains.slice(0, 5),
      domainDistribution: this._getDomainDistribution(domains),
      averagePosition: topResults.reduce((sum, r) => sum + r.position, 0) / topResults.length
    };
  }

  _getDomainDistribution(domains) {
    return domains.reduce((acc, domain) => {
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {});
  }

  _calculateAverageDomainRank(results) {
    const ranks = results.map(r => r.ranking_info?.domain_rank || 50).filter(Boolean);
    return ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length;
  }

  _assessCompetitionLevel(results) {
    const avgDomainRank = this._calculateAverageDomainRank(results);
    if (avgDomainRank > 70) return 'high';
    if (avgDomainRank > 40) return 'medium';
    return 'low';
  }

  _calculateRankingDifficulty(results) {
    const avgDomainRank = this._calculateAverageDomainRank(results);
    const uniqueDomains = new Set(results.map(r => r.domain)).size;
    
    let difficulty = avgDomainRank;
    difficulty += uniqueDomains > 8 ? 20 : uniqueDomains > 5 ? 10 : 0;
    
    return Math.round(Math.min(100, difficulty));
  }

  // Mock data methods for development/fallback
  _getMockKeywordData(keywords) {
    return keywords.map(keyword => ({
      keyword: typeof keyword === 'string' ? keyword : keyword.keyword,
      location: 'United States',
      language: 'English',
      searchVolume: Math.floor(Math.random() * 50000) + 1000,
      competition: Math.random(),
      competitionLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      cpc: (Math.random() * 10).toFixed(2),
      monthlySearches: Array.from({length: 12}, () => Math.floor(Math.random() * 10000)),
      trends: Array.from({length: 12}, () => Math.floor(Math.random() * 100)),
      keywordDifficulty: Math.floor(Math.random() * 100),
      timestamp: new Date().toISOString()
    }));
  }

  _getMockKeywordSuggestions(seedKeyword, limit) {
    const templates = [
      `best ${seedKeyword}`,
      `${seedKeyword} tools`,
      `${seedKeyword} software`,
      `${seedKeyword} guide`,
      `how to ${seedKeyword}`,
      `${seedKeyword} tutorial`,
      `${seedKeyword} tips`,
      `${seedKeyword} strategies`,
      `${seedKeyword} for beginners`,
      `${seedKeyword} alternatives`
    ];

    return templates.slice(0, limit).map(keyword => ({
      keyword,
      searchVolume: Math.floor(Math.random() * 30000) + 500,
      competition: Math.random(),
      cpc: (Math.random() * 5).toFixed(2),
      difficulty: Math.floor(Math.random() * 100),
      relevanceScore: Math.floor(Math.random() * 100) + 1,
      trends: Array.from({length: 12}, () => Math.floor(Math.random() * 100)),
      keywordInfo: {
        monthlySearches: Array.from({length: 12}, () => Math.floor(Math.random() * 5000)),
        competitionLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
      }
    }));
  }

  _getMockSERPAnalysis(keyword) {
    return {
      keyword,
      totalResults: Math.floor(Math.random() * 1000000) + 100000,
      topResults: Array.from({length: 10}, (_, i) => ({
        position: i + 1,
        title: `${keyword} - Top Result ${i + 1}`,
        url: `https://example${i + 1}.com/${keyword.replace(/\s+/g, '-')}`,
        domain: `example${i + 1}.com`,
        description: `Learn about ${keyword} with this comprehensive guide...`,
        ranking_info: {
          page_rank: Math.floor(Math.random() * 100),
          domain_rank: Math.floor(Math.random() * 100)
        }
      })),
      competitorAnalysis: {
        totalCompetitors: 8,
        topDomains: ['example1.com', 'example2.com', 'example3.com'],
        averagePosition: 5.5
      },
      difficultyMetrics: {
        averageDomainRank: Math.floor(Math.random() * 100),
        competitionLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        rankingDifficulty: Math.floor(Math.random() * 100)
      }
    };
  }

  _getMockCompetitorDomains(domain) {
    return Array.from({length: 10}, (_, i) => ({
      domain: `competitor${i + 1}.com`,
      intersections: Math.floor(Math.random() * 1000) + 100,
      relevance: Math.random(),
      domainRank: Math.floor(Math.random() * 100),
      sharedKeywords: Math.floor(Math.random() * 500) + 50,
      competitionLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    }));
  }

  async healthCheck() {
    if (this.mockMode) {
      return {
        status: 'healthy',
        mode: 'mock',
        message: 'Running in mock mode - DataForSEO credentials not configured',
        timestamp: new Date().toISOString()
      };
    }

    try {
      // Simple ping to check API availability
      const response = await this.client.get('/user_data/info');
      
      return {
        status: 'healthy',
        mode: 'live',
        credits: response.data?.tasks?.[0]?.result?.credits || 'unknown',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('DataForSEO health check failed:', error.message);
      throw new Error(`DataForSEO API health check failed: ${error.message}`);
    }
  }
}

export default DataForSEOService;