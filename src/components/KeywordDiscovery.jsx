import { useState } from 'react'
import { Search, TrendingUp, Target, Globe, ExternalLink, CheckCircle, ArrowRight, FileText } from 'lucide-react'
import ProgressIndicator from './ProgressIndicator'
import websiteAnalyzer from '../services/websiteAnalyzer'

const KeywordDiscovery = () => {
  // Step 1: Website Analysis
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [websiteContent, setWebsiteContent] = useState(null)
  const [seedKeywords, setSeedKeywords] = useState([])
  
  // Step 2: Keyword Selection
  const [selectedKeywords, setSelectedKeywords] = useState([])
  
  // Step 3: Results
  const [keywordReport, setKeywordReport] = useState(null)
  const [seoAnalysis, setSeoAnalysis] = useState(null)
  
  // UI States
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  // Step 1: Analyze Website
  const handleWebsiteAnalysis = async (e) => {
    e.preventDefault()
    if (!websiteUrl.trim()) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      // Step 1: Fetch website content
      setProgress(20)
      const content = await websiteAnalyzer.fetchWebsiteContent(websiteUrl)
      setWebsiteContent(content)
      
      // Step 2: Generate seed keywords
      setProgress(60)
      const analysis = await websiteAnalyzer.generateSeedKeywords(content)
      setSeedKeywords(analysis.seedKeywords || [])
      
      setProgress(100)
      setCurrentStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  // Step 2: Generate Keyword Report
  const handleKeywordSelection = async () => {
    if (selectedKeywords.length === 0) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      // Generate detailed keyword report using Gemini as DataForSEO replacement
      setProgress(30)
      const report = await websiteAnalyzer.generateKeywordReport(
        selectedKeywords, 
        websiteContent?.websiteAnalysis || {}
      )
      setKeywordReport(report)
      
      // Generate complete SEO analysis
      setProgress(70)
      const analysis = await websiteAnalyzer.generateSEOAnalysis(
        report, 
        websiteContent, 
        selectedKeywords
      )
      setSeoAnalysis(analysis)
      
      setProgress(100)
      setCurrentStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const toggleKeywordSelection = (keyword) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword.keyword) 
        ? prev.filter(k => k !== keyword.keyword)
        : [...prev, keyword.keyword]
    )
  }

  const resetProcess = () => {
    setCurrentStep(1)
    setWebsiteUrl('')
    setWebsiteContent(null)
    setSeedKeywords([])
    setSelectedKeywords([])
    setKeywordReport(null)
    setSeoAnalysis(null)
    setError(null)
  }



  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className="font-medium">Website Analysis</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
              </div>
              <span className="font-medium">Keyword Selection</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {currentStep >= 3 ? <CheckCircle className="w-5 h-5" /> : '3'}
              </div>
              <span className="font-medium">SEO Analysis</span>
            </div>
          </div>
          {currentStep > 1 && (
            <button onClick={resetProcess} className="btn-secondary">
              Start Over
            </button>
          )}
        </div>
      </div>

      {/* Step 1: Website Analysis */}
      {currentStep === 1 && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Website Analysis</h2>
              <p className="text-gray-600">Enter your website URL to analyze content and generate seed keywords</p>
            </div>
          </div>

          <form onSubmit={handleWebsiteAnalysis} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
              <div className="relative">
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://your-website.com"
                  className="input-field pl-10"
                  disabled={isProcessing}
                  required
                />
                <ExternalLink className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            <button
              type="submit"
              disabled={isProcessing || !websiteUrl.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Analyzing Website...' : 'Analyze Website & Generate Keywords'}
            </button>
          </form>

          {isProcessing && (
            <div className="mt-6">
              <ProgressIndicator progress={progress} />
              <p className="text-center text-sm text-gray-600 mt-2">
                {progress < 30 ? 'Fetching website content...' : 
                 progress < 80 ? 'Analyzing content with Google Gemini...' : 
                 'Generating seed keywords...'}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">⚠️ {error}</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Keyword Selection */}
      {currentStep === 2 && websiteContent && (
        <div className="space-y-6">
          {/* Website Summary */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Website Analysis Summary</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-700">Website Title</h4>
                <p className="text-gray-900">{websiteContent.title}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Content Quality</h4>
                <p className="text-gray-900">{websiteContent.wordCount} words, {websiteContent.headings.length} headings</p>
              </div>
            </div>
            {websiteContent.metaDescription && (
              <div>
                <h4 className="font-medium text-gray-700">Meta Description</h4>
                <p className="text-gray-600">{websiteContent.metaDescription}</p>
              </div>
            )}
          </div>

          {/* Seed Keywords Selection */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Select Target Keywords</h3>
                <p className="text-gray-600">Choose 3-5 keywords to generate detailed analysis</p>
              </div>
              <div className="text-sm text-gray-500">
                {selectedKeywords.length} selected
              </div>
            </div>

            <div className="grid gap-3 mb-6">
              {seedKeywords.map((keyword, index) => (
                <div 
                  key={index}
                  onClick={() => toggleKeywordSelection(keyword)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedKeywords.includes(keyword.keyword)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedKeywords.includes(keyword.keyword)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedKeywords.includes(keyword.keyword) && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{keyword.keyword}</h4>
                          <p className="text-sm text-gray-600">{keyword.rationale}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        keyword.relevance === 'high' ? 'bg-green-100 text-green-800' :
                        keyword.relevance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {keyword.relevance} relevance
                      </span>
                      <span className="text-sm text-gray-500">#{keyword.priority}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleKeywordSelection}
              disabled={selectedKeywords.length === 0 || isProcessing}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Generating Keyword Report...' : `Generate Detailed Analysis (${selectedKeywords.length} keywords)`}
            </button>

            {isProcessing && (
              <div className="mt-6">
                <ProgressIndicator progress={progress} />
                <p className="text-center text-sm text-gray-600 mt-2">
                  {progress < 40 ? 'Creating detailed keyword report...' : 
                   progress < 80 ? 'Analyzing competition and opportunities...' : 
                   'Generating SEO recommendations...'}
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">⚠️ {error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {currentStep === 3 && seoAnalysis && (
        <div className="space-y-6">
          {/* SEO Analysis Report */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Complete SEO Analysis & Strategy</h3>
                <p className="text-gray-600">Comprehensive report with actionable recommendations</p>
              </div>
            </div>

            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: seoAnalysis.analysis.replace(/\n/g, '<br/>') }} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-3">Key Recommendations</h4>
              <ul className="space-y-2">
                {seoAnalysis.recommendations?.slice(0, 5).map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-3">Expected Impact</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority Level</span>
                  <span className="font-medium text-red-600">{seoAnalysis.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Impact</span>
                  <span className="font-medium text-green-600">{seoAnalysis.estimatedImpact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Keywords Analyzed</span>
                  <span className="font-medium">{selectedKeywords.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default KeywordDiscovery