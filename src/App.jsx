import { useEffect, useState } from 'react'
import { Bot, Zap, TrendingUp, FileText, Settings } from 'lucide-react'
import KeywordDiscovery from './components/KeywordDiscovery'
import ContentGenerator from './components/ContentGenerator'
import APIStatusDashboard from './components/APIStatusDashboard'

import keywordService from './services/keywordService'

function App() {
  const [servicesReady, setServicesReady] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [activeTab, setActiveTab] = useState('keywords')

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
                Analyze your website and discover hundreds of keyword opportunities to create 
                a programmatic SEO strategy that generates thousands of targeted landing pages.
              </p>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Discover 100+ Keywords</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border">
                  <Zap className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium text-gray-700">Bulk Content Strategy</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border">
                  <Bot className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Programmatic SEO</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                <button
                  onClick={() => setActiveTab('keywords')}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    activeTab === 'keywords'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Keyword Research
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    activeTab === 'content'
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  AI Content Generator
                </button>
                <button
                  onClick={() => setActiveTab('status')}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    activeTab === 'status'
                      ? 'bg-green-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  API Status
                </button>

              </div>
            </div>

            {/* Tab Content */}
            <div className="mb-12">
              {activeTab === 'keywords' && <KeywordDiscovery />}
              {activeTab === 'content' && <ContentGenerator />}
              {activeTab === 'status' && <APIStatusDashboard />}
            </div>

            {/* Footer Info */}
            <div className="text-center py-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                Powered by Google Gemini AI • Designed for Programmatic SEO at Scale
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App