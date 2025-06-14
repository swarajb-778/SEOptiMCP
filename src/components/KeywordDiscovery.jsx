import { useState } from 'react'
import { Search, TrendingUp, Target, Globe, ExternalLink, CheckCircle, ArrowRight, FileText, Code, Download, Database } from 'lucide-react'
import ProgressIndicator from './ProgressIndicator'
import websiteAnalyzer from '../services/websiteAnalyzer'
import { geminiService } from '../services/geminiService'
import { seoPageGenerator } from '../services/seoPageGenerator'
import { featureformMCP } from '../services/featureformMCP'

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
  const handleAnalyzeWebsite = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!websiteUrl.trim()) return
    
    setIsProcessing(true)
    setProgress(0)
    setError(null)
    
    try {
      setProgress(50)
      const content = await websiteAnalyzer.analyzeWebsite(websiteUrl)
      setWebsiteContent(content)
      
      // Store in our MCP for persistence
      const websiteId = featureformMCP.storeWebsiteAnalysis(websiteUrl, content.websiteAnalysis)
      setWebsiteContent({
        ...content,
        websiteId: websiteId
      })
      
      setCurrentStep(2)
      setProgress(100)
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
      // Generate SEO pages using the new SEO page generator
      setProgress(30)
      const seoPages = await seoPageGenerator.generateSEOPages(
        websiteContent?.websiteAnalysis || {},
        selectedKeywords
      )
      
      // Store SEO pages and keywords in MCP
      if (websiteContent?.websiteId) {
        featureformMCP.storeSEOPages(websiteContent.websiteId, seoPages)
        featureformMCP.storeKeywordData(websiteContent.websiteId, selectedKeywords)
      }
      
      // Generate master plan
      setProgress(70)
      const masterPlan = await geminiService.generateProgrammaticSEOPlan(
        websiteContent?.websiteAnalysis || {},
        selectedKeywords
      )
      
      // Format the analysis for display
      const analysis = {
        analysis: masterPlan,
        seoPages: seoPages,
        selectedKeywords: selectedKeywords,
        websiteAnalysis: websiteContent?.websiteAnalysis,
        websiteId: websiteContent?.websiteId
      }
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

  const downloadImplementationCode = (seoPages) => {
    try {
      // Generate Next.js implementation code
      const nextjsCode = seoPageGenerator.generateNextJSCode(seoPages.pages)
      
      // Create downloadable files
      const files = [
        {
          name: 'dynamic-seo-page.js',
          content: nextjsCode.dynamicPageCode
        },
        {
          name: 'setup-instructions.txt',
          content: nextjsCode.setupInstructions.join('\n')
        },
        {
          name: 'page-data.json',
          content: JSON.stringify(seoPages.pages, null, 2)
        }
      ]
      
      // Create and download ZIP file (simplified version)
      files.forEach(file => {
        const blob = new Blob([file.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      })
      
    } catch (error) {
      console.error('Download failed:', error)
      setError('Failed to generate implementation code')
    }
  }

  const loadWebsiteData = (websiteId) => {
    try {
      const data = featureformMCP.getWebsiteData(websiteId)
      
      if (data.website) {
        // Load website analysis data
        setWebsiteUrl(data.website.url)
        setWebsiteContent({
          websiteAnalysis: data.website.analysis,
          websiteId: websiteId,
          seedKeywords: data.keywords?.selectedKeywords || []
        })
        setSeedKeywords(data.keywords?.selectedKeywords || [])
        
        // If SEO pages exist, load them
        if (data.seoPages) {
          const analysis = {
            analysis: 'Previously generated analysis loaded from MCP storage',
            seoPages: data.seoPages,
            selectedKeywords: data.keywords?.selectedKeywords || [],
            websiteAnalysis: data.website.analysis,
            websiteId: websiteId
          }
          setSeoAnalysis(analysis)
          setSelectedKeywords(data.keywords?.selectedKeywords || [])
          setCurrentStep(3)
        } else {
          setCurrentStep(2)
        }
      }
    } catch (error) {
      console.error('Failed to load website data:', error)
      setError('Failed to load website data from MCP storage')
    }
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
                <h2 className="text-2xl font-bold text-gray-900">Programmatic SEO Analysis</h2>
                <p className="text-gray-600">Analyze your website to discover 100+ keyword opportunities for thousands of SEO pages</p>
              </div>
          </div>

          <form onSubmit={handleAnalyzeWebsite} className="space-y-4">
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
                                 <h3 className="text-xl font-semibold text-gray-900">Build Your Programmatic SEO Strategy</h3>
                 <p className="text-gray-600">Select keywords to generate a content strategy for hundreds of SEO pages</p>
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
              {isProcessing ? 'Creating Programmatic SEO Plan...' : `Generate Master Plan (${selectedKeywords.length} keywords)`}
            </button>

            {isProcessing && (
              <div className="mt-6">
                <ProgressIndicator progress={progress} />
                <p className="text-center text-sm text-gray-600 mt-2">
                  Creating your programmatic SEO strategy to generate thousands of pages...
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
          {/* SEO Pages Generated */}
          {seoAnalysis.seoPages && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Generated SEO Pages</h3>
                  <p className="text-gray-600">{seoAnalysis.seoPages.totalPages} optimized pages ready for implementation</p>
                </div>
              </div>

              {/* Page Cards */}
              <div className="grid gap-4 mb-6">
                {seoAnalysis.seoPages.pages.map((page, index) => (
                  <div key={index} className="border rounded-lg p-6 bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{page.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{page.metaDescription}</p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {page.keyword}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {page.technicalSEO.wordCount} words
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {page.technicalSEO.estimatedReadTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* SEO Details */}
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">SEO Elements</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• URL: <code className="bg-gray-200 px-1 rounded">{page.url}</code></li>
                          <li>• H1: {page.h1}</li>
                          <li>• Keyword Density: {page.technicalSEO.keywordDensity}</li>
                          <li>• Schema: Article markup included</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Content Structure</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• {page.content.mainSections.length} main sections</li>
                          <li>• {page.seoElements.ctaButtons.length} CTA buttons</li>
                          <li>• {page.seoElements.internalLinks.length} internal links</li>
                          <li>• Readability: {page.technicalSEO.readabilityScore}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Implementation Guide */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">Implementation Guide</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-blue-800 mb-2">Next.js Setup</h5>
                    <ol className="text-sm text-blue-700 space-y-1">
                      {seoAnalysis.seoPages.implementation.implementation && Object.values(seoAnalysis.seoPages.implementation.implementation).map((step, index) => (
                        <li key={index}>• {step}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800 mb-2">Expected Results</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• {seoAnalysis.seoPages.implementation.estimatedTraffic.monthlyVisitors} monthly visitors</li>
                      <li>• {seoAnalysis.seoPages.implementation.estimatedTraffic.conversionRate} conversion rate</li>
                      <li>• {seoAnalysis.seoPages.implementation.estimatedTraffic.potentialLeads} potential leads/month</li>
                      <li>• Cost: ~$0.20 per page</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Download Code Button */}
              <div className="mt-6 text-center">
                <button 
                  onClick={() => downloadImplementationCode(seoAnalysis.seoPages)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Next.js Implementation Code
                </button>
              </div>
            </div>
          )}

          {/* SEO Analysis Report */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">SEO Strategy & Implementation Plan</h3>
                <p className="text-gray-600">Complete roadmap for your 4-5 page SEO strategy</p>
              </div>
            </div>

            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: seoAnalysis.analysis.replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        </div>
      )}

      {/* MCP Data Dashboard */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">MCP Data Dashboard</h3>
            <p className="text-gray-600">Previously analyzed websites and their SEO performance</p>
          </div>
        </div>

        {(() => {
          const storedWebsites = featureformMCP.getAllWebsites();
          
          if (storedWebsites.length === 0) {
            return (
              <div className="text-center py-8 text-gray-500">
                <p>No websites analyzed yet. Start by analyzing your first website above!</p>
              </div>
            );
          }

          return (
            <div className="grid gap-4">
              {storedWebsites.slice(0, 5).map((website) => {
                const summary = featureformMCP.getWebsiteSummary(website.id);
                return (
                  <div key={website.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{website.url}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {website.analysis?.primaryNiche} • {website.analysis?.businessType}
                        </p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>📄 {summary?.totalPages || 0} SEO Pages</span>
                          <span>🔑 {summary?.totalKeywords || 0} Keywords</span>
                          <span>👥 {summary?.performance?.totalVisitors || 0} Visitors</span>
                          <span>💰 {summary?.performance?.conversionRate || '0%'} Conversion</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          summary?.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {summary?.status || 'pending'}
                        </span>
                        <button 
                          onClick={() => loadWebsiteData(website.id)}
                          className="btn-secondary text-xs"
                        >
                          Load
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  )
}

export default KeywordDiscovery