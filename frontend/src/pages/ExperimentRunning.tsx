import { useState, useEffect, useRef } from "react"
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
  const [streamStarted, setStreamStarted] = useState(false)
  const [expData, setExpData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

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
          
          // Populate past logs to show in the terminal
          const now = new Date()
          const pastLogs = stages.map((stage, i) => {
            const time = new Date(now.getTime() - (stages.length - i) * 3500) // Stagger by 3.5s
            return `[${time.toLocaleTimeString('en-US', { hour12: false })}] ${stage} started`
          })
          pastLogs.push(`[${now.toLocaleTimeString('en-US', { hour12: false })}] Experiment ${expId} completed successfully with ${data.mutations?.length || 0} mutations evaluated`)
          setLogs(pastLogs)
        } else {
          setStreamStarted(true)
        }
      })
      .catch(err => {
        console.warn("Could not fetch experiment info:", err)
      })
  }, [expId])

  // Real-time SSE Stream
  useEffect(() => {
    if (!streamStarted || completed) return;
    const apiUrl = import.meta.env.VITE_API_URL || ""
    
    const eventSource = new EventSource(`${apiUrl}/api/experiments/${expId}/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          setError(data.error);
          eventSource.close();
          return;
        }
        
        if (data.log) {
          const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
          setLogs(prev => [...prev, `[${timeStr}] ${data.log}`]);
          
          // Increment progress stages based on log content
          if (data.log.includes("baseline ML-KEM")) setCurrentStage(1);
          else if (data.log.includes("Generating parameter mutations")) setCurrentStage(2);
          else if (data.log.includes("Running correctness tests")) setCurrentStage(3);
          else if (data.log.includes("Running security estimation")) setCurrentStage(4);
          else if (data.log.includes("Benchmarking execution times")) setCurrentStage(5);
          else if (data.log.includes("Statistical analysis")) setCurrentStage(6);
          else if (data.log.includes("Generating final results")) setCurrentStage(7);
        }
        
        if (data.done) {
          setCompleted(true);
          setCurrentStage(stages.length);
          eventSource.close();
        }
      } catch (e) {
        console.error("Error parsing SSE data", e);
      }
    };
    
    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      setError("Lost connection to execution stream.");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [streamStarted, completed, expId])

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
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Execution Logs (Terminal)</h4>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-xs text-green-400 h-64 overflow-y-auto space-y-2 shadow-inner relative">
                {logs.map((log, i) => {
                  const match = log.match(/^(\[.*?\])\s(.*)/);
                  if (match) {
                    return (
                      <div key={i} className="flex items-start gap-2 border-b border-gray-800 pb-1">
                        <span className="text-blue-400 shrink-0">{match[1]}</span>
                        <span className="text-gray-200 break-words">{match[2]}</span>
                      </div>
                    );
                  }
                  return <div key={i} className="text-gray-200">{log}</div>;
                })}
                {!completed && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-green-500 animate-pulse">▶</span>
                    <span className="text-gray-500 italic">Processing...</span>
                  </div>
                )}
                <div ref={logsEndRef} />
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

