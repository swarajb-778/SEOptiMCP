import mcpClient from './mcpClient'

class KeywordService {
  constructor() {
    this.client = mcpClient
  }

  async initializeServices() {
    try {
      await this.client.connect()
      return true
    } catch (error) {
      console.error('Failed to initialize MCP services:', error)
      return false
    }
  }

  async discoverKeywords(seedKeyword, options = {}) {
    const {
      maxSuggestions = 50,
      includeCompetitorAnalysis = true,
      generateContentIdeas = true
    } = options

    try {
      // Step 1: Get keyword suggestions
      const suggestions = await this.client.getKeywordSuggestions(seedKeyword, maxSuggestions)
      
      // Step 2: Get search volume data for all keywords
      const keywords = [seedKeyword, ...suggestions.map(s => s.keyword)]
      const volumeData = await this.client.getSearchVolume(keywords)
      
      // Step 3: Organize into clusters
      const clusters = this.organizeIntoCluster(volumeData, seedKeyword)
      
      // Step 4: Get competitor analysis if requested
      let competitorData = null
      if (includeCompetitorAnalysis) {
        competitorData = await this.client.getCompetitorAnalysis(seedKeyword)
      }
      
      // Step 5: Generate content ideas if requested
      let contentIdeas = null
      if (generateContentIdeas) {
        const topKeywords = volumeData
          .sort((a, b) => b.search_volume - a.search_volume)
          .slice(0, 10)
          .map(k => k.keyword)
        contentIdeas = await this.client.generateContentIdeas(topKeywords)
      }

      return {
        seedKeyword,
        totalKeywords: keywords.length,
        clusters,
        competitorData,
        contentIdeas,
        summary: this.generateSummary(clusters, volumeData)
      }
    } catch (error) {
      console.error('Keyword discovery failed:', error)
      throw new Error(`Failed to discover keywords: ${error.message}`)
    }
  }

  organizeIntoCluster(volumeData, seedKeyword) {
    const clusters = new Map()
    
    volumeData.forEach(item => {
      const keyword = item.keyword.toLowerCase()
      let clusterName = 'general'
      
      // Simple clustering logic based on keyword patterns
      if (keyword.includes('tool') || keyword.includes('software') || keyword.includes('platform')) {
        clusterName = 'tools'
      } else if (keyword.includes('guide') || keyword.includes('tutorial') || keyword.includes('how to')) {
        clusterName = 'guides'
      } else if (keyword.includes('best') || keyword.includes('top') || keyword.includes('review')) {
        clusterName = 'reviews'
      } else if (keyword.includes('vs') || keyword.includes('comparison') || keyword.includes('alternative')) {
        clusterName = 'comparisons'
      } else if (keyword.includes('price') || keyword.includes('cost') || keyword.includes('free')) {
        clusterName = 'pricing'
      } else if (keyword.includes('example') || keyword.includes('template') || keyword.includes('case study')) {
        clusterName = 'examples'
      }
      
      if (!clusters.has(clusterName)) {
        clusters.set(clusterName, {
          name: clusterName,
          theme: this.getClusterTheme(clusterName, seedKeyword),
          keywords: [],
          totalVolume: 0,
          avgDifficulty: 0,
          opportunity: 'medium'
        })
      }
      
      const cluster = clusters.get(clusterName)
      cluster.keywords.push(item)
      cluster.totalVolume += item.search_volume
    })
    
    // Calculate averages and opportunities
    clusters.forEach(cluster => {
      cluster.avgDifficulty = Math.round(
        cluster.keywords.reduce((sum, k) => sum + k.keyword_difficulty, 0) / cluster.keywords.length
      )
      
      // Determine opportunity based on volume and difficulty
      const volumeScore = cluster.totalVolume > 10000 ? 2 : cluster.totalVolume > 5000 ? 1 : 0
      const difficultyScore = cluster.avgDifficulty < 40 ? 2 : cluster.avgDifficulty < 70 ? 1 : 0
      const opportunityScore = volumeScore + difficultyScore
      
      cluster.opportunity = opportunityScore >= 3 ? 'high' : opportunityScore >= 2 ? 'medium' : 'low'
      
      // Sort keywords by volume within cluster
      cluster.keywords.sort((a, b) => b.search_volume - a.search_volume)
    })
    
    return Array.from(clusters.values())
      .sort((a, b) => b.totalVolume - a.totalVolume)
  }

  getClusterTheme(clusterName, seedKeyword) {
    const themes = {
      tools: `${seedKeyword} Tools & Software`,
      guides: `${seedKeyword} Guides & Tutorials`,
      reviews: `${seedKeyword} Reviews & Recommendations`,
      comparisons: `${seedKeyword} Comparisons & Alternatives`,
      pricing: `${seedKeyword} Pricing & Costs`,
      examples: `${seedKeyword} Examples & Templates`,
      general: `General ${seedKeyword} Topics`
    }
    
    return themes[clusterName] || `${seedKeyword} Related Topics`
  }

  generateSummary(clusters, volumeData) {
    const totalVolume = volumeData.reduce((sum, k) => sum + k.search_volume, 0)
    const avgDifficulty = Math.round(
      volumeData.reduce((sum, k) => sum + k.keyword_difficulty, 0) / volumeData.length
    )
    
    const highOpportunityClusters = clusters.filter(c => c.opportunity === 'high').length
    const mediumOpportunityClusters = clusters.filter(c => c.opportunity === 'medium').length
    
    return {
      totalSearchVolume: totalVolume,
      averageDifficulty: avgDifficulty,
      totalClusters: clusters.length,
      opportunityBreakdown: {
        high: highOpportunityClusters,
        medium: mediumOpportunityClusters,
        low: clusters.length - highOpportunityClusters - mediumOpportunityClusters
      },
      topCluster: clusters[0]?.name || 'none'
    }
  }

  async optimizeContentForKeywords(content, targetKeywords) {
    try {
      return await this.client.optimizeContent(content, targetKeywords)
    } catch (error) {
      console.error('Content optimization failed:', error)
      throw new Error(`Failed to optimize content: ${error.message}`)
    }
  }

  getServiceStatus() {
    return this.client.getConnectionStatus()
  }
}

// Export singleton instance
export const keywordService = new KeywordService()
export default keywordService