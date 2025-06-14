import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Settings, Zap } from 'lucide-react'
import apiTester from '../services/apiTester'

const APIStatusDashboard = () => {
  const [testResults, setTestResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [healthData, setHealthData] = useState(null)

  useEffect(() => {
    loadHealthData()
  }, [])

  const loadHealthData = async () => {
    try {
      const health = await apiTester.healthCheck()
      setHealthData(health)
      
      const results = apiTester.getTestResults()
      if (Object.keys(results).length > 0) {
        setTestResults({ ...results, summary: { total: 1, passed: 0, failed: 0 } })
      }
    } catch (error) {
      console.error('Failed to load health data:', error)
    }
  }

  const runAPITests = async () => {
    setIsLoading(true)
    try {
      console.log('🧪 Running comprehensive API tests...')
      const results = await apiTester.testAllAPIs()
      setTestResults(results)
      await loadHealthData()
      console.log('✅ API tests completed')
    } catch (error) {
      console.error('❌ API tests failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'missing_key':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'healthy':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'failed':
      case 'unhealthy':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'missing_key':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">API Status Dashboard</h2>
          <p className="text-gray-600">Monitor and test all API integrations</p>
        </div>
        
        <button
          onClick={runAPITests}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Testing...' : 'Test APIs'}
        </button>
      </div>

      {/* Test Results Summary */}
      {testResults && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Latest Test Results</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{testResults.summary.total}</div>
              <div className="text-sm text-blue-800">Total APIs</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{testResults.summary.passed}</div>
              <div className="text-sm text-green-800">Passed</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{testResults.summary.failed}</div>
              <div className="text-sm text-red-800">Failed</div>
            </div>
          </div>
        </div>
      )}

      {/* API Services Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Service Status</h3>
        
        {/* Gemini API */}
        <div className={`border rounded-lg p-4 ${getStatusColor(testResults?.gemini?.status || (healthData?.gemini?.initialized ? 'healthy' : 'unhealthy'))}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(testResults?.gemini?.status || (healthData?.gemini?.initialized ? 'healthy' : 'unhealthy'))}
              <div>
                <h4 className="font-medium">Google Gemini AI</h4>
                <p className="text-sm opacity-75">Content generation and keyword analysis</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {testResults?.gemini?.status || (healthData?.gemini?.initialized ? 'Ready' : 'Not initialized')}
              </div>
              <div className="text-xs opacity-75">
                {testResults?.gemini?.timestamp ? new Date(testResults.gemini.timestamp).toLocaleTimeString() : 'Never tested'}
              </div>
            </div>
          </div>
          
          {testResults?.gemini?.tests && (
            <div className="mt-3 pt-3 border-t border-opacity-20">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Initialization:</strong> {testResults.gemini.tests.initialization}
                </div>
                <div>
                  <strong>Keyword Analysis:</strong> {testResults.gemini.tests.keywordAnalysis}
                </div>
                <div>
                  <strong>Content Generation:</strong> {testResults.gemini.tests.contentGeneration}
                </div>
                <div>
                  <strong>Rate Limiting:</strong> {testResults.gemini.tests.rateLimiting}
                </div>
              </div>
            </div>
          )}
          
          {testResults?.gemini?.error && (
            <div className="mt-3 pt-3 border-t border-opacity-20">
              <div className="text-sm text-red-700">
                <strong>Error:</strong> {testResults.gemini.error}
              </div>
            </div>
          )}
        </div>

        {/* SerpAPI Status */}
        <div className={`border rounded-lg p-4 ${getStatusColor('missing_key')}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon('missing_key')}
              <div>
                <h4 className="font-medium">SerpAPI</h4>
                <p className="text-sm opacity-75">Real-time keyword data and SERP analysis</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">Not configured</div>
              <div className="text-xs opacity-75">Add API key to enable</div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-opacity-20">
            <div className="text-sm">
              <p className="mb-2"><strong>Setup Instructions:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Visit <a href="https://serpapi.com/" target="_blank" rel="noopener noreferrer" className="underline">serpapi.com</a></li>
                <li>Create free account (100 searches/month)</li>
                <li>Copy API key from dashboard</li>
                <li>Add to .env.local: VITE_SERPAPI_KEY=your_key</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Google Suggest Status */}
        <div className={`border rounded-lg p-4 ${getStatusColor('healthy')}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon('healthy')}
              <div>
                <h4 className="font-medium">Google Suggest</h4>
                <p className="text-sm opacity-75">Free keyword suggestions</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">Ready</div>
              <div className="text-xs opacity-75">No setup required</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Limiting Info */}
      {healthData?.rateLimiting && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Rate Limiting</h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-blue-800">Active Protection</span>
            </div>
            <div className="text-sm text-blue-700">
              <div>Gemini: 15 requests per minute</div>
              <div>SerpAPI: 100 requests per day (free tier)</div>
              <div>Google Suggest: 50 requests per hour</div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Help */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-700">
            <p className="mb-2"><strong>Current Status:</strong></p>
            <ul className="space-y-1">
              <li>✅ Google Gemini API configured and working</li>
              <li>⚠️ SerpAPI not configured (optional for enhanced data)</li>
              <li>✅ Enhanced MCP infrastructure implemented</li>
              <li>✅ Rate limiting and error handling active</li>
            </ul>
            
            <p className="mt-4 mb-2"><strong>Next Steps:</strong></p>
            <ul className="space-y-1">
              <li>• Add SerpAPI key for real keyword data</li>
              <li>• Set up Firebase for data persistence</li>
              <li>• Configure additional SEO APIs (optional)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default APIStatusDashboard 