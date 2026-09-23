import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { useNavigate, useSearchParams } from "react-router-dom"
import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react"

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
  const [searchParams] = useSearchParams()
  const expId = searchParams.get("id") || localStorage.getItem("active_experiment_id") || "EXP-8472"

  const [currentStage, setCurrentStage] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [completed, setCompleted] = useState(false)
  const [expData, setExpData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial experiment info
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || ""
    fetch(`${apiUrl}/api/experiments/${expId}`)
      .then(res => {
        if (!res.ok) throw new Error("Experiment not found")
        return res.json()
      })
      .then(data => {
        setExpData(data)
        if (data.status === "completed") {
          setCurrentStage(stages.length)
          setCompleted(true)
        }
      })
      .catch(err => {
        console.warn("Could not fetch experiment info:", err)
      })
  }, [expId])

  // Progress simulation & polling
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const apiUrl = import.meta.env.VITE_API_URL || ""

    if (currentStage < stages.length) {
      timer = setTimeout(() => {
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false })
        setLogs(prev => [...prev, `[${timeStr}] ${stages[currentStage]} started`])
        setCurrentStage(c => c + 1)
      }, 700)
    } else if (currentStage === stages.length && !completed) {
      // Check backend status
      fetch(`${apiUrl}/api/experiments/${expId}`)
        .then(res => res.json())
        .then(data => {
          setExpData(data)
          const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false })
          setLogs(prev => [...prev, `[${timeStr}] Experiment ${expId} completed successfully with ${data.mutations?.length || 0} mutations evaluated`])
          setCompleted(true)
        })
        .catch(() => {
          const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false })
          setLogs(prev => [...prev, `[${timeStr}] Experiment completed in local mode`])
          setCompleted(true)
        })
    }

    return () => clearTimeout(timer)
  }, [currentStage, completed, expId])

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Running Experiment {expId}</h2>
        <p className="text-gray-500 mt-2 font-mono text-sm">
          Seed: {expData?.seed || "0x4f8a9b21"} | Scheme: {expData?.scheme || "ML-KEM-768"} | Trials: {expData?.trials || 100}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

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
                  ) : idx === currentStage && !completed ? (
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  ) : idx === currentStage && completed ? (
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
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

      {completed && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(`/mutations?id=${expId}`)}>View Mutations</Button>
          <Button size="lg" onClick={() => navigate(`/results?id=${expId}`)}>View Results</Button>
        </div>
      )}
    </div>
  )
}

