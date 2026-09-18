import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"

const stages = [
  "Preparing baseline ML-KEM configuration",
  "Generating parameter mutations",
  "Running correctness tests",
  "Running security estimation",
  "Benchmarking execution times",
  "Statistical analysis",
  "Generating final results"
]

export function ExperimentRunning() {
  const navigate = useNavigate()
  const [currentStage, setCurrentStage] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (currentStage < stages.length) {
      timer = setTimeout(() => {
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false })
        setLogs(prev => [...prev, `[${timeStr}] ${stages[currentStage]} started`])
        setCurrentStage(c => c + 1)
      }, 1500)
    } else if (currentStage === stages.length) {
      timer = setTimeout(() => {
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false })
        setLogs(prev => [...prev, `[${timeStr}] Experiment completed successfully`])
        setCurrentStage(c => c + 1)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [currentStage])

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Running Experiment EXP-8473</h2>
        <p className="text-gray-500 mt-2 font-mono text-sm">
          Seed: 0x4f8a9b21 | Scheme: ML-KEM-768 | Trials: 100
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Execution Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              {stages.map((stage, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  {idx < currentStage ? (
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  ) : idx === currentStage ? (
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                  <span className={`text-sm ${idx <= currentStage ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {stage}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Execution Logs</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 font-mono text-xs text-gray-700 h-48 overflow-y-auto space-y-1">
                {logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentStage > stages.length && (
        <div className="flex justify-end">
          <Button size="lg" onClick={() => navigate('/results')}>View Results</Button>
        </div>
      )}
    </div>
  )
}
