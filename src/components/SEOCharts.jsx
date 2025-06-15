import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer, 
  LineChart, Line, Area, AreaChart 
} from 'recharts'

// Color palette for charts
const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981', 
  accent: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  cyan: '#06B6D4'
}

// SEO Score Gauge Chart
export const SEOScoreGauge = ({ score, title = "SEO Score" }) => {
  const normalizedScore = Math.min(Math.max(score || 0, 0), 100)
  const data = [
    { name: 'Score', value: normalizedScore, color: normalizedScore >= 80 ? COLORS.secondary : normalizedScore >= 60 ? COLORS.accent : COLORS.danger },
    { name: 'Remaining', value: 100 - normalizedScore, color: '#E5E7EB' }
  ]

  return (
    <div className="flex flex-col items-center">
      <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
      <ResponsiveContainer width={120} height={120}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius={35}
            outerRadius={50}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-2">
        <div className="text-2xl font-bold text-gray-900">{normalizedScore}</div>
        <div className="text-xs text-gray-500">out of 100</div>
      </div>
    </div>
  )
}

// Keyword Difficulty Distribution Chart
export const KeywordDifficultyChart = ({ keywords = [] }) => {
  if (!keywords.length) return null

  // Process keyword data for difficulty distribution
  const difficultyData = keywords.reduce((acc, keyword) => {
    const difficulty = keyword.difficulty || keyword.competitionLevel || 'medium'
    const category = difficulty.toLowerCase()
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})

  const chartData = [
    { name: 'Low', value: difficultyData.low || 0, fill: COLORS.secondary },
    { name: 'Medium', value: difficultyData.medium || 0, fill: COLORS.accent },
    { name: 'High', value: difficultyData.high || 0, fill: COLORS.danger }
  ]

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-4">Keyword Difficulty Distribution</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Search Volume Distribution Chart
export const SearchVolumeChart = ({ keywords = [] }) => {
  if (!keywords.length) return null

  // Process keywords by search volume ranges
  const volumeRanges = keywords.reduce((acc, keyword) => {
    const volume = parseInt(keyword.searchVolume || keyword.monthlySearchVolume || 0)
    let range
    if (volume >= 10000) range = '10K+'
    else if (volume >= 1000) range = '1K-10K'
    else if (volume >= 100) range = '100-1K'
    else range = '0-100'
    
    acc[range] = (acc[range] || 0) + 1
    return acc
  }, {})

  const chartData = [
    { range: '0-100', count: volumeRanges['0-100'] || 0 },
    { range: '100-1K', count: volumeRanges['100-1K'] || 0 },
    { range: '1K-10K', count: volumeRanges['1K-10K'] || 0 },
    { range: '10K+', count: volumeRanges['10K+'] || 0 }
  ]

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-4">Search Volume Distribution</h4>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="count" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.6} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Competition Analysis Chart
export const CompetitionChart = ({ competitionData }) => {
  if (!competitionData?.overallInsights) return null

  // Create mock competition strength data
  const competitorStrength = [
    { competitor: 'Top 3 Avg', strength: 85, color: COLORS.danger },
    { competitor: 'Industry Avg', strength: 65, color: COLORS.accent },
    { competitor: 'Your Site', strength: competitionData.overallInsights.currentStrength || 45, color: COLORS.primary },
    { competitor: 'Opportunity', strength: 25, color: COLORS.secondary }
  ]

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-4">Competitive Landscape</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={competitorStrength} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="competitor" type="category" width={80} />
          <Tooltip />
          <Bar dataKey="strength" radius={[0, 4, 4, 0]}>
            {competitorStrength.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ROI Projection Chart
export const ROIProjectionChart = ({ masterStrategy }) => {
  if (!masterStrategy?.executiveSummary) return null

  // Create projection data for 12 months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const baselineTraffic = 1000
  const projectedGrowth = [1.1, 1.25, 1.4, 1.6, 1.8, 2.1, 2.4, 2.8, 3.2, 3.6, 4.0, 4.5]

  const projectionData = months.map((month, index) => ({
    month,
    baseline: baselineTraffic,
    projected: Math.round(baselineTraffic * projectedGrowth[index]),
    revenue: Math.round(baselineTraffic * projectedGrowth[index] * 0.02 * 100) // 2% conversion, $100 avg
  }))

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-4">12-Month Traffic & Revenue Projection</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={projectionData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="traffic" orientation="left" />
          <YAxis yAxisId="revenue" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="traffic" type="monotone" dataKey="baseline" stroke={COLORS.accent} strokeDasharray="3 3" name="Current Traffic" />
          <Line yAxisId="traffic" type="monotone" dataKey="projected" stroke={COLORS.primary} strokeWidth={3} name="Projected Traffic" />
          <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke={COLORS.secondary} strokeWidth={2} name="Est. Revenue ($)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Progress Meter Component
export const ProgressMeter = ({ value, max = 100, label, color = COLORS.primary, showPercentage = true }) => {
  const percentage = Math.round((value / max) * 100)
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {showPercentage && (
          <span className="text-sm text-gray-500">{percentage}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color 
          }}
        />
      </div>
    </div>
  )
}

// Multi-Progress Component for SEO Metrics
export const SEOProgressMeters = ({ keywordAnalysis, masterStrategy }) => {
  const metrics = [
    {
      label: 'Keyword Research Complete',
      value: keywordAnalysis?.summary?.totalKeywords || 0,
      max: 50,
      color: COLORS.primary
    },
    {
      label: 'High Opportunity Keywords',
      value: keywordAnalysis?.summary?.highOpportunity || 0,
      max: 15,
      color: COLORS.secondary
    },
    {
      label: 'Strategy Implementation',
      value: masterStrategy ? 100 : 0,
      max: 100,
      color: COLORS.accent
    },
    {
      label: 'Competitive Analysis',
      value: keywordAnalysis?.expandedKeywords?.length > 20 ? 100 : 50,
      max: 100,
      color: COLORS.purple
    }
  ]

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700 mb-4">Analysis Progress</h4>
      {metrics.map((metric, index) => (
        <ProgressMeter
          key={index}
          label={metric.label}
          value={metric.value}
          max={metric.max}
          color={metric.color}
        />
      ))}
    </div>
  )
}

// Keyword Categories Pie Chart
export const KeywordCategoriesChart = ({ keywords = [] }) => {
  if (!keywords.length) return null

  const categoryCount = keywords.reduce((acc, keyword) => {
    const category = keyword.category || 'general'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(categoryCount).map(([category, count], index) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count,
    fill: Object.values(COLORS)[index % Object.values(COLORS).length]
  }))

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-4">Keyword Categories</h4>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
} 