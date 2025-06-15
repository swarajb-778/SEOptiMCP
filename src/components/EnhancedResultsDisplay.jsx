import { useState } from 'react'
import { Brain, Target, TrendingUp, Users, BarChart3, Calendar, FileText, Download, ExternalLink, ChevronDown, ChevronUp, Share2 } from 'lucide-react'
import { 
  SEOScoreGauge, 
  KeywordDifficultyChart, 
  SearchVolumeChart, 
  CompetitionChart, 
  ROIProjectionChart, 
  SEOProgressMeters, 
  KeywordCategoriesChart 
} from './SEOCharts'
import { 
  exportToPDF, 
  exportKeywordsToCSV, 
  exportCompetitionToCSV, 
  exportStrategyToJSON, 
  exportCompleteAnalysis 
} from '../utils/exportUtils'

const EnhancedResultsDisplay = ({ keywordAnalysis, competitionData, masterStrategy }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedSections, setExpandedSections] = useState({})
  const [isExporting, setIsExporting] = useState(false)

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Export handlers
  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      await exportToPDF('enhanced-results-display', 'seo-analysis-report')
      alert('PDF report downloaded successfully!')
    } catch (error) {
      alert('Failed to export PDF: ' + error.message)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportKeywordsCSV = async () => {
    setIsExporting(true)
    try {
      await exportKeywordsToCSV(keywordAnalysis?.expandedKeywords, 'keyword-analysis')
      alert('Keywords CSV downloaded successfully!')
    } catch (error) {
      alert('Failed to export keywords: ' + error.message)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCompleteAnalysis = async () => {
    setIsExporting(true)
    try {
      await exportCompleteAnalysis({ 
        keywordAnalysis, 
        competitionData, 
        masterStrategy 
      }, 'complete-seo-analysis')
      alert('Complete analysis exported successfully!')
    } catch (error) {
      alert('Failed to export complete analysis: ' + error.message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6" id="enhanced-results-display">
      {/* Executive Summary Dashboard */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Enhanced AI Analysis Complete</h3>
            <p className="text-gray-600">Comprehensive SEO strategy powered by Google Gemini</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-800">
              {keywordAnalysis?.summary?.totalKeywords || 0}
            </div>
            <div className="text-sm text-blue-600">Total Keywords</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-800">
              {keywordAnalysis?.summary?.highOpportunity || 0}
            </div>
            <div className="text-sm text-green-600">High Opportunity</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-800">
              {keywordAnalysis?.summary?.avgSearchVolume || 0}
            </div>
            <div className="text-sm text-purple-600">Avg Search Volume</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-2xl font-bold text-orange-800">
              {masterStrategy?.executiveSummary?.currentScore || 0}
            </div>
            <div className="text-sm text-orange-600">SEO Score</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'keywords', label: 'Keywords', icon: Target },
              { id: 'competition', label: 'Competition', icon: TrendingUp },
              { id: 'strategy', label: 'Strategy', icon: Users },
              { id: 'content', label: 'Content Plan', icon: Calendar }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* SEO Score and Progress */}
              <div className="grid md:grid-cols-3 gap-6">
                <SEOScoreGauge 
                  score={masterStrategy?.executiveSummary?.currentScore || 0} 
                  title="Current SEO Score" 
                />
                <div className="md:col-span-2">
                  <SEOProgressMeters 
                    keywordAnalysis={keywordAnalysis}
                    masterStrategy={masterStrategy}
                  />
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <KeywordCategoriesChart keywords={keywordAnalysis?.expandedKeywords} />
                <ROIProjectionChart masterStrategy={masterStrategy} />
              </div>

              {/* Executive Summary */}
              {masterStrategy?.executiveSummary && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">Executive Summary</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-blue-700 font-medium">Current SEO Score:</span>
                      <span className="ml-2 text-blue-900 font-bold">
                        {masterStrategy.executiveSummary.currentScore}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Traffic Increase:</span>
                      <span className="ml-2 text-blue-900 font-bold">
                        {masterStrategy.executiveSummary.trafficIncrease}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Timeline:</span>
                      <span className="ml-2 text-blue-900 font-bold">
                        {masterStrategy.executiveSummary.timelineToResults}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Projected ROI:</span>
                      <span className="ml-2 text-blue-900 font-bold">
                        {masterStrategy.executiveSummary.projectedROI}
                      </span>
                    </div>
                  </div>
                  
                  {masterStrategy.executiveSummary.topOpportunities?.length > 0 && (
                    <div className="mt-4">
                      <span className="text-blue-700 font-medium">Top Opportunities:</span>
                      <ul className="mt-2 space-y-1">
                        {masterStrategy.executiveSummary.topOpportunities.map((opportunity, index) => (
                          <li key={index} className="text-blue-800 text-sm">
                            • {opportunity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Top Recommendations */}
              {keywordAnalysis?.summary?.topRecommendations && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">🎯 AI Top Recommendations</h4>
                  <div className="flex flex-wrap gap-2">
                    {keywordAnalysis.summary.topRecommendations.map((keyword, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        ⭐ {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Wins */}
              {competitionData?.overallInsights?.quickWins && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">⚡ Quick Wins</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {competitionData.overallInsights.quickWins.map((win, index) => (
                      <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">{win}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Keywords Tab */}
          {activeTab === 'keywords' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-900">Expanded Keyword Analysis</h4>
                <span className="text-sm text-gray-500">
                  {keywordAnalysis?.expandedKeywords?.length || 0} keywords found
                </span>
              </div>

              {/* Keyword Analytics Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <KeywordDifficultyChart keywords={keywordAnalysis?.expandedKeywords} />
                <SearchVolumeChart keywords={keywordAnalysis?.expandedKeywords} />
              </div>
              
              {/* Keyword Categories */}
              {keywordAnalysis?.expandedKeywords && (
                <div className="space-y-4">
                  {['commercial', 'long-tail', 'question', 'comparison'].map(category => {
                    const categoryKeywords = keywordAnalysis.expandedKeywords.filter(k => k.category === category)
                    if (categoryKeywords.length === 0) return null
                    
                    return (
                      <div key={category} className="border rounded-lg">
                        <button
                          onClick={() => toggleSection(category)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                        >
                          <div>
                            <h5 className="font-medium text-gray-900 capitalize">{category} Keywords</h5>
                            <p className="text-sm text-gray-600">{categoryKeywords.length} keywords</p>
                          </div>
                          {expandedSections[category] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                        
                        {expandedSections[category] && (
                          <div className="border-t p-4">
                            <div className="grid gap-3">
                              {categoryKeywords.slice(0, 10).map((keyword, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <span className="font-medium text-gray-900">{keyword.keyword}</span>
                                    <div className="text-xs text-gray-500 mt-1">{keyword.contentAngle}</div>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs">
                                    <span className="text-blue-600">Vol: {keyword.searchVolume}</span>
                                    <span className="text-purple-600">Intent: {keyword.commercialIntent}/10</span>
                                    <span className="text-orange-600">Diff: {keyword.difficulty}/10</span>
                                    <span className={`px-2 py-1 rounded ${
                                      keyword.opportunity === 'high' ? 'bg-green-100 text-green-800' :
                                      keyword.opportunity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {keyword.opportunity}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Competition Tab */}
          {activeTab === 'competition' && competitionData && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900">Competitive Analysis</h4>
              
              {/* Competition Chart */}
              <CompetitionChart competitionData={competitionData} />
              
              {/* Overall Insights */}
              {competitionData.overallInsights && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Best Opportunities</h5>
                      {competitionData.overallInsights.bestOpportunities?.map((opp, index) => (
                        <div key={index} className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                          {opp}
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Content Gaps</h5>
                      {competitionData.overallInsights.contentGaps?.map((gap, index) => (
                        <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                          {gap}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Positioning Advice</h5>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                      <p className="text-purple-800 text-sm">{competitionData.overallInsights.positioningAdvice}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Strategy Tab */}
          {activeTab === 'strategy' && masterStrategy && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900">12-Month SEO Strategy</h4>
              
              {/* Implementation Roadmap */}
              {masterStrategy.implementationRoadmap && (
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(masterStrategy.implementationRoadmap).map(([period, tasks]) => (
                    <div key={period} className="p-4 border rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-3 capitalize">
                        {period.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h5>
                      <ul className="space-y-1">
                        {tasks?.map((task, index) => (
                          <li key={index} className="text-sm text-gray-700">• {task}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content Plan Tab */}
          {activeTab === 'content' && masterStrategy?.contentStrategy && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900">Content Strategy</h4>
              
              {/* Blog Calendar */}
              {masterStrategy.contentStrategy.blogCalendar && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Blog Content Calendar</h5>
                  <div className="grid gap-4">
                    {masterStrategy.contentStrategy.blogCalendar.slice(0, 3).map((month, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h6 className="font-medium text-gray-800 mb-2">{month.month}</h6>
                        <div className="grid md:grid-cols-2 gap-2">
                          {month.posts?.map((post, postIndex) => (
                            <div key={postIndex} className="p-2 bg-gray-50 rounded text-sm">
                              {post}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Landing Pages & Resources */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Landing Pages</h5>
                  {masterStrategy.contentStrategy.landingPages?.map((page, index) => (
                    <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 mb-2">
                      {page}
                    </div>
                  ))}
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Resource Pages</h5>
                  {masterStrategy.contentStrategy.resourcePages?.map((resource, index) => (
                    <div key={index} className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800 mb-2">
                      {resource}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Export Analysis</h4>
            <p className="text-gray-600 text-sm">Download your complete SEO analysis and strategy</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Generating...' : 'Download PDF'}
            </button>
            <button 
              onClick={handleExportKeywordsCSV}
              disabled={isExporting || !keywordAnalysis?.expandedKeywords?.length}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              Keywords CSV
            </button>
            <button 
              onClick={handleExportCompleteAnalysis}
              disabled={isExporting}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Share2 className="w-4 h-4" />
              Complete Bundle
            </button>
          </div>
        </div>
        
        {/* Export Help Text */}
        <div className="mt-4 text-xs text-gray-500 border-t pt-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <strong>PDF Report:</strong> Complete visual analysis with charts and insights
            </div>
            <div>
              <strong>Keywords CSV:</strong> Spreadsheet with all keyword data for further analysis
            </div>
            <div>
              <strong>Complete Bundle:</strong> JSON file with all analysis data for developers
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedResultsDisplay 