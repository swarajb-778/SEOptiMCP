// API Testing and Health Check Service
import geminiService from './geminiService.js'

class APITester {
  constructor() {
    this.testResults = new Map()
    this.rateLimiter = new Map()
  }

  // Rate limiting implementation
  async checkRateLimit(serviceName, maxRequests = 15, windowMs = 60000) {
    const now = Date.now()
    const windowStart = now - windowMs
    
    if (!this.rateLimiter.has(serviceName)) {
      this.rateLimiter.set(serviceName, [])
    }
    
    const requests = this.rateLimiter.get(serviceName)
    // Remove old requests outside the window
    const recentRequests = requests.filter(timestamp => timestamp > windowStart)
    
    if (recentRequests.length >= maxRequests) {
      const oldestRequest = Math.min(...recentRequests)
      const waitTime = oldestRequest + windowMs - now
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`)
    }
    
    recentRequests.push(now)
    this.rateLimiter.set(serviceName, recentRequests)
  }

  async testGeminiAPI() {
    try {
      await this.checkRateLimit('gemini', 15, 60000) // 15 requests per minute
      
      console.log('🧪 Testing Gemini API connectivity...')
      
      // Test 1: Basic initialization
      const isInitialized = geminiService.isInitialized()
      if (!isInitialized) {
        throw new Error('Gemini service not initialized - check API key')
      }
      
      // Test 2: Simple keyword analysis
      const testKeywords = await geminiService.analyzeKeywords('AI tools', 5)
      if (!Array.isArray(testKeywords) || testKeywords.length === 0) {
        throw new Error('Keyword analysis returned invalid data')
      }
      
      // Test 3: Basic content generation
      const testContent = await geminiService.generateSEOContent(
        'AI Tools for Marketing', 
        ['AI marketing', 'automation tools']
      )
      
      if (!testContent.title || !testContent.content) {
        throw new Error('Content generation returned invalid structure')
      }
      
      const result = {
        status: 'success',
        service: 'Google Gemini',
        tests: {
          initialization: '✅ Passed',
          keywordAnalysis: `✅ Generated ${testKeywords.length} keywords`,
          contentGeneration: `✅ Generated ${testContent.wordCount || 'unknown'} words`,
          rateLimiting: '✅ Active'
        },
        timestamp: new Date().toISOString()
      }
      
      this.testResults.set('gemini', result)
      console.log('✅ Gemini API test completed successfully')
      
      return result
      
    } catch (error) {
      const result = {
        status: 'failed',
        service: 'Google Gemini',
        error: error.message,
        timestamp: new Date().toISOString()
      }
      
      this.testResults.set('gemini', result)
      console.error('❌ Gemini API test failed:', error.message)
      
      return result
    }
  }

  async testAllAPIs() {
    console.log('🚀 Starting comprehensive API testing...')
    
    const results = {
      gemini: await this.testGeminiAPI(),
      // Future API tests will be added here
      summary: {
        total: 1,
        passed: 0,
        failed: 0
      }
    }
    
    // Calculate summary
    Object.values(results).forEach(result => {
      if (result.status === 'success') results.summary.passed++
      else if (result.status === 'failed') results.summary.failed++
    })
    
    console.log(`📊 API Testing Summary: ${results.summary.passed}/${results.summary.total} passed`)
    
    return results
  }

  getTestResults() {
    return Object.fromEntries(this.testResults)
  }

  // Health check for all services
  async healthCheck() {
    return {
      gemini: {
        initialized: geminiService.isInitialized(),
        lastTest: this.testResults.get('gemini')?.timestamp || 'Never tested',
        status: this.testResults.get('gemini')?.status || 'Unknown'
      },
      rateLimiting: {
        active: true,
        limits: {
          gemini: '15 requests/minute'
        }
      },
      timestamp: new Date().toISOString()
    }
  }
}

// Export singleton
export const apiTester = new APITester()
export default apiTester 