// Enhanced MCP Client with Real API Integration
import realApiService from './realApiService.js'
import geminiService from './geminiService.js'
import apiTester from './apiTester.js'

class EnhancedMCPClient {
  constructor() {
    this.isConnected = false
    this.realApiService = realApiService
    this.geminiService = geminiService
    this.apiTester = apiTester
    
    this.services = {
      serpAPI: { connected: false, endpoint: 'https://serpapi.com' },
      gemini: { connected: false, endpoint: 'https://generativelanguage.googleapis.com' },
      googleSuggest: { connected: false, endpoint: 'https://suggestqueries.google.com' }
    }

    this.healthChecks = new Map()
    this.lastHealthCheck = null
  }

  async connect() {
    console.log('🔌 Connecting to enhanced MCP services...')
    
    try {
      // Test all API connections
      const testResults = await this.apiTester.testAllAPIs()
      
      // Update service status based on test results
      this.services.gemini.connected = testResults.gemini.status === 'success'
      this.services.serpAPI.connected = !!this.realApiService.apiKeys.serpApi
      this.services.googleSuggest.connected = true // Always available
      
      this.isConnected = Object.values(this.services).some(service => service.connected)
      
      if (this.isConnected) {
        console.log('✅ Enhanced MCP client connected successfully')
        this.scheduleHealthChecks()
      } else {
        console.warn('⚠️ MCP client connected with limited functionality')
      }
      
      return this.isConnected
      
    } catch (error) {
      console.error('❌ Failed to connect MCP client:', error)
      this.isConnected = false
      return false
    }
  }

  async disconnect() {
    console.log('🔌 Disconnecting MCP services...')
    this.isConnected = false
    Object.values(this.services).forEach(service => {
      service.connected = false
    })
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
  }

  // Enhanced keyword research with real APIs
  async getSearchVolume(keywords) {
    if (!this.isConnected) {
      throw new Error('MCP client not connected')
    }

    try {
      console.log(`🔍 Getting search volume for ${keywords.length} keywords...`)
      
      // Use real API service for search volume data
      const volumeData = await this.realApiService.getKeywordData(keywords)
      
      console.log(`✅ Retrieved search volume data for ${volumeData.length} keywords`)
      return volumeData
      
    } catch (error) {
      console.error('Search volume fetch failed:', error)
      throw new Error(`Failed to get search volume: ${error.message}`)
    }
  }

  // Enhanced keyword suggestions with real APIs
  async getKeywordSuggestions(seedKeyword, limit = 20) {
    if (!this.isConnected) {
      throw new Error('MCP client not connected')
    }

    try {
      console.log(`💡 Getting keyword suggestions for: ${seedKeyword}`)
      
      // Get suggestions from real API
      const suggestions = await this.realApiService.getKeywordSuggestions(seedKeyword, limit)
      
      console.log(`✅ Generated ${suggestions.length} keyword suggestions`)
      return suggestions
      
    } catch (error) {
      console.error('Keyword suggestions failed:', error)
      throw new Error(`Failed to get keyword suggestions: ${error.message}`)
    }
  }

  // Enhanced competitor analysis
  async getCompetitorAnalysis(keyword) {
    if (!this.isConnected) {
      throw new Error('MCP client not connected')
    }

    try {
      console.log(`🎯 Analyzing competitors for: ${keyword}`)
      
      // Get SERP data for competitor analysis
      const serpData = await this.realApiService.getKeywordData([keyword])
      
      if (serpData.length === 0) {
        throw new Error('No SERP data available for competitor analysis')
      }
      
      const keywordData = serpData[0]
      
      // Enhanced competitor analysis using SERP features
      const competitorAnalysis = {
        keyword,
        difficulty: keywordData.keyword_difficulty,
        competition_level: keywordData.competition,
        serp_features: keywordData.serp_features,
        estimated_traffic: keywordData.search_volume,
        opportunities: this.identifyOpportunities(keywordData),
        strategy_recommendations: this.generateStrategyRecommendations(keywordData)
      }
      
      console.log(`✅ Competitor analysis completed for: ${keyword}`)
      return competitorAnalysis
      
    } catch (error) {
      console.error('Competitor analysis failed:', error)
      throw new Error(`Failed to analyze competitors: ${error.message}`)
    }
  }

  // AI-powered content ideas generation
  async generateContentIdeas(keywords, contentType = 'blog') {
    if (!this.services.gemini.connected) {
      console.warn('Gemini service not available, using basic content ideas')
      return this.generateBasicContentIdeas(keywords, contentType)
    }

    try {
      console.log(`✨ Generating AI content ideas for ${keywords.length} keywords...`)
      
      // Use Gemini for intelligent content idea generation
      const contentStrategy = await this.geminiService.generateContentStrategy(
        keywords.slice(0, 10), // Limit to prevent token overflow
        contentType
      )
      
      const contentIdeas = contentStrategy.contentIdeas || []
      
      console.log(`✅ Generated ${contentIdeas.length} AI-powered content ideas`)
      return contentIdeas
      
    } catch (error) {
      console.error('AI content generation failed:', error)
      // Fallback to basic content ideas
      return this.generateBasicContentIdeas(keywords, contentType)
    }
  }

  // Enhanced content optimization
  async optimizeContent(content, targetKeywords) {
    if (!this.services.gemini.connected) {
      throw new Error('Gemini service required for content optimization')
    }

    try {
      console.log(`🔧 Optimizing content for ${targetKeywords.length} keywords...`)
      
      const optimization = await this.geminiService.optimizeContent(content, targetKeywords)
      
      console.log(`✅ Content optimization completed with score: ${optimization.seoScore}`)
      return optimization
      
    } catch (error) {
      console.error('Content optimization failed:', error)
      throw new Error(`Failed to optimize content: ${error.message}`)
    }
  }

  // Helper methods
  identifyOpportunities(keywordData) {
    const opportunities = []
    
    if (keywordData.keyword_difficulty < 40) {
      opportunities.push('Low competition - good opportunity for ranking')
    }
    
    if (keywordData.search_volume > 10000) {
      opportunities.push('High search volume - significant traffic potential')
    }
    
    if (keywordData.serp_features.includes('featured_snippet')) {
      opportunities.push('Featured snippet opportunity available')
    }
    
    if (keywordData.serp_features.includes('people_also_ask')) {
      opportunities.push('FAQ content opportunity')
    }
    
    if (keywordData.competition === 'low' && parseFloat(keywordData.cpc) > 2) {
      opportunities.push('Commercial intent with low competition')
    }
    
    return opportunities
  }

  generateStrategyRecommendations(keywordData) {
    const recommendations = []
    
    if (keywordData.keyword_difficulty > 70) {
      recommendations.push('Consider long-tail variations to reduce competition')
    }
    
    if (keywordData.serp_features.includes('local_pack')) {
      recommendations.push('Optimize for local SEO if applicable')
    }
    
    if (keywordData.competition === 'high') {
      recommendations.push('Create comprehensive, high-quality content to compete')
    }
    
    recommendations.push(`Target content length: ${this.recommendContentLength(keywordData)} words`)
    
    return recommendations
  }

  recommendContentLength(keywordData) {
    if (keywordData.keyword_difficulty > 70) return '2500-3500'
    if (keywordData.keyword_difficulty > 40) return '1500-2500'
    return '1000-1500'
  }

  generateBasicContentIdeas(keywords, contentType) {
    return keywords.slice(0, 10).map(keyword => ({
      keyword,
      title: `Complete Guide to ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
      type: contentType,
      priority: 'medium',
      estimatedTraffic: Math.floor(Math.random() * 5000) + 1000
    }))
  }

  // Health monitoring
  async performHealthCheck() {
    const healthData = {
      timestamp: new Date().toISOString(),
      services: {},
      overall_status: 'healthy'
    }

    // Check each service
    for (const [serviceName, service] of Object.entries(this.services)) {
      try {
        let status = 'unknown'
        
        if (serviceName === 'gemini') {
          status = this.geminiService.isInitialized() ? 'healthy' : 'unhealthy'
        } else if (serviceName === 'serpAPI') {
          status = this.realApiService.apiKeys.serpApi ? 'healthy' : 'missing_key'
        } else if (serviceName === 'googleSuggest') {
          status = 'healthy' // Always available
        }
        
        healthData.services[serviceName] = {
          status,
          connected: service.connected,
          endpoint: service.endpoint
        }
        
        if (status === 'unhealthy') {
          healthData.overall_status = 'degraded'
        }
        
      } catch (error) {
        healthData.services[serviceName] = {
          status: 'error',
          error: error.message
        }
        healthData.overall_status = 'degraded'
      }
    }

    this.lastHealthCheck = healthData
    this.healthChecks.set(Date.now(), healthData)
    
    // Keep only last 10 health checks
    if (this.healthChecks.size > 10) {
      const oldest = Math.min(...this.healthChecks.keys())
      this.healthChecks.delete(oldest)
    }
    
    return healthData
  }

  scheduleHealthChecks() {
    // Perform health check every 5 minutes
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck()
    }, 5 * 60 * 1000)
    
    // Initial health check
    this.performHealthCheck()
  }

  // Status and monitoring
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      services: this.services,
      lastHealthCheck: this.lastHealthCheck,
      apiTester: this.apiTester.getTestResults(),
      realApiStatus: this.realApiService.getServiceStatus()
    }
  }

  getHealthHistory() {
    return Array.from(this.healthChecks.entries())
      .sort(([a], [b]) => b - a)
      .slice(0, 10)
      .map(([timestamp, data]) => ({ timestamp, ...data }))
  }
}

// Export singleton
export const enhancedMcpClient = new EnhancedMCPClient()
export default enhancedMcpClient 