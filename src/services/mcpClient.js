// Mock MCP Client for development
// This will be replaced with real MCP server connections later

class MockMCPClient {
  constructor() {
    this.isConnected = false
    this.servers = {
      dataForSEO: { connected: false, endpoint: 'mock://dataforseo' },
      perplexity: { connected: false, endpoint: 'mock://perplexity' }
    }
  }

  async connect() {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    this.isConnected = true
    this.servers.dataForSEO.connected = true
    this.servers.perplexity.connected = true
    return true
  }

  async disconnect() {
    this.isConnected = false
    this.servers.dataForSEO.connected = false
    this.servers.perplexity.connected = false
  }

  // Mock DataForSEO API calls
  async getSearchVolume(keywords) {
    if (!this.servers.dataForSEO.connected) {
      throw new Error('DataForSEO server not connected')
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    return keywords.map(keyword => ({
      keyword,
      search_volume: Math.floor(Math.random() * 50000) + 1000,
      keyword_difficulty: Math.floor(Math.random() * 100),
      cpc: (Math.random() * 10).toFixed(2),
      competition: Math.random() > 0.5 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low'
    }))
  }

  async getKeywordSuggestions(seedKeyword, limit = 20) {
    if (!this.servers.dataForSEO.connected) {
      throw new Error('DataForSEO server not connected')
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    const suggestions = [
      `best ${seedKeyword}`,
      `${seedKeyword} tools`,
      `${seedKeyword} software`,
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
      `${seedKeyword} checklist`
    ]

    return suggestions.slice(0, limit).map(keyword => ({
      keyword,
      search_volume: Math.floor(Math.random() * 30000) + 500,
      keyword_difficulty: Math.floor(Math.random() * 100),
      relevance_score: Math.floor(Math.random() * 100) + 1
    }))
  }

  async getCompetitorAnalysis(keyword) {
    if (!this.servers.dataForSEO.connected) {
      throw new Error('DataForSEO server not connected')
    }

    await new Promise(resolve => setTimeout(resolve, 1200))

    return {
      top_competitors: [
        { domain: 'example1.com', authority: 85, pages: 150 },
        { domain: 'example2.com', authority: 78, pages: 89 },
        { domain: 'example3.com', authority: 72, pages: 203 }
      ],
      content_gaps: [
        `${keyword} comparison`,
        `${keyword} pricing guide`,
        `${keyword} implementation`
      ]
    }
  }

  // Mock Perplexity API calls
  async generateContentIdeas(keywords, contentType = 'blog') {
    if (!this.servers.perplexity.connected) {
      throw new Error('Perplexity server not connected')
    }

    await new Promise(resolve => setTimeout(resolve, 1500))

    const ideas = keywords.map(keyword => ({
      keyword,
      title: `The Ultimate Guide to ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
      outline: [
        `What is ${keyword}?`,
        `Benefits of ${keyword}`,
        `How to get started with ${keyword}`,
        `Best practices for ${keyword}`,
        `Common mistakes to avoid`,
        `Tools and resources`
      ],
      estimated_length: Math.floor(Math.random() * 2000) + 1500,
      target_audience: contentType === 'blog' ? 'beginners to intermediate' : 'all levels'
    }))

    return ideas
  }

  async optimizeContent(content, _targetKeywords) {
    if (!this.servers.perplexity.connected) {
      throw new Error('Perplexity server not connected')
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      optimized_content: content,
      seo_score: Math.floor(Math.random() * 40) + 60,
      suggestions: [
        'Add more internal links',
        'Optimize meta description',
        'Include more semantic keywords',
        'Improve readability score'
      ],
      keyword_density: {
        primary: Math.floor(Math.random() * 3) + 1,
        secondary: Math.floor(Math.random() * 2) + 0.5
      }
    }
  }

  // Health check
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      servers: this.servers,
      last_check: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const mcpClient = new MockMCPClient()
export default mcpClient