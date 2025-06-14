import { useState } from 'react'
import { Search, TrendingUp, Target, Globe } from 'lucide-react'
import ProgressIndicator from './ProgressIndicator'

const KeywordDiscovery = () => {
  const [keyword, setKeyword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState(null)
  const [progress, setProgress] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!keyword.trim()) return

    setIsProcessing(true)
    setProgress(0)
    setResults(null)

    // Simulate MCP processing steps
    const steps = [
      'Analyzing seed keyword...',
      'Fetching search volume data...',
      'Identifying keyword clusters...',
      'Calculating difficulty scores...',
      'Generating content opportunities...'
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setProgress(((i + 1) / steps.length) * 100)
    }

    // Mock results
    setResults({
      seedKeyword: keyword,
      clusters: [
        {
          id: 1,
          theme: `${keyword} tools`,
          keywords: [`best ${keyword}`, `${keyword} software`, `${keyword} platforms`],
          volume: 12500,
          difficulty: 45,
          opportunity: 'high'
        },
        {
          id: 2,
          theme: `${keyword} guide`,
          keywords: [`${keyword} tutorial`, `how to use ${keyword}`, `${keyword} for beginners`],
          volume: 8900,
          difficulty: 32,
          opportunity: 'medium'
        },
        {
          id: 3,
          theme: `${keyword} comparison`,
          keywords: [`${keyword} vs`, `${keyword} alternatives`, `compare ${keyword}`],
          volume: 6200,
          difficulty: 38,
          opportunity: 'high'
        }
      ]
    })

    setIsProcessing(false)
  }

  const getDifficultyColor = (difficulty) => {
    if (difficulty < 30) return 'text-green-600 bg-green-100'
    if (difficulty < 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getOpportunityColor = (opportunity) => {
    return opportunity === 'high' ? 'text-emerald-600 bg-emerald-100' : 'text-blue-600 bg-blue-100'
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Keyword Discovery</h2>
            <p className="text-gray-600">Enter a seed keyword to discover content opportunities</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter your seed keyword (e.g., 'AI tools', 'digital marketing')"
              className="input-field"
              disabled={isProcessing}
            />
          </div>
          <button
            type="submit"
            disabled={isProcessing || !keyword.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Analyzing Keywords...' : 'Discover Keywords'}
          </button>
        </form>

        {isProcessing && (
          <div className="mt-6">
            <ProgressIndicator progress={progress} />
          </div>
        )}
      </div>

      {results && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Keyword Clusters for "{results.seedKeyword}"
            </h3>
            
            <div className="grid gap-4">
              {results.clusters.map((cluster) => (
                <div key={cluster.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-seo-blue" />
                      <h4 className="font-semibold text-gray-900">{cluster.theme}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOpportunityColor(cluster.opportunity)}`}>
                        {cluster.opportunity} opportunity
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Volume:</span>
                      <span className="font-medium">{cluster.volume.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Difficulty:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(cluster.difficulty)}`}>
                        {cluster.difficulty}/100
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Related keywords:</p>
                    <div className="flex flex-wrap gap-2">
                      {cluster.keywords.map((kw, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default KeywordDiscovery