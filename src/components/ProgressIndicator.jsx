import { Bot, CheckCircle, Loader2 } from 'lucide-react'

const ProgressIndicator = ({ progress = 0 }) => {
  const steps = [
    { id: 1, label: 'Analyzing seed keyword', threshold: 20 },
    { id: 2, label: 'Fetching search volume data', threshold: 40 },
    { id: 3, label: 'Identifying keyword clusters', threshold: 60 },
    { id: 4, label: 'Calculating difficulty scores', threshold: 80 },
    { id: 5, label: 'Generating content opportunities', threshold: 100 }
  ]

  const getStepStatus = (threshold) => {
    if (progress >= threshold) return 'completed'
    if (progress >= threshold - 20) return 'active'
    return 'pending'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">AI Agent Processing</h3>
          <p className="text-sm text-gray-600">Analyzing your keywords with MCP servers</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="space-y-3">
        {steps.map((step) => {
          const status = getStepStatus(step.threshold)
          
          return (
            <div key={step.id} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : status === 'active' ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <span
                className={`text-sm ${
                  status === 'completed'
                    ? 'text-green-700 font-medium'
                    : status === 'active'
                    ? 'text-blue-700 font-medium'
                    : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Progress Percentage */}
      <div className="text-center">
        <span className="text-sm font-medium text-gray-700">
          {Math.round(progress)}% Complete
        </span>
      </div>
    </div>
  )
}

export default ProgressIndicator