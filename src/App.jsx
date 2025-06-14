import { useEffect, useState } from 'react'
import { Bot, Zap, TrendingUp } from 'lucide-react'
import KeywordDiscovery from './components/KeywordDiscovery'
import keywordService from './services/keywordService'

function App() {
  const [servicesReady, setServicesReady] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const initializeServices = async () => {
      try {
        const success = await keywordService.initializeServices()
        setServicesReady(success)
      } catch (error) {
        console.error('Failed to initialize services:', error)
        setServicesReady(false)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeServices()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI SEO Agent</h1>
                <p className="text-sm text-gray-600">Programmatic SEO Content Generator</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full ${servicesReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
                MCP Services {servicesReady ? 'Ready' : 'Initializing'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isInitializing ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <Bot className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing AI Services</h2>
              <p className="text-gray-600">Connecting to MCP servers...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Generate Thousands of SEO Pages
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Enter a seed keyword and watch our AI agents discover keyword opportunities, 
                analyze competitors, and generate content strategies for programmatic SEO.
              </p>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Keyword Research</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border">
                  <Zap className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium text-gray-700">AI Content Generation</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border">
                  <Bot className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">MCP Integration</span>
                </div>
              </div>
            </div>

            {/* Keyword Discovery Component */}
            <div className="mb-12">
              <KeywordDiscovery />
            </div>

            {/* Footer Info */}
            <div className="text-center py-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                Powered by DataForSEO and Perplexity MCP servers • Built for marketers
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App