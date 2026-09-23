import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { sensitivityData as fallbackData } from "../data/mockData"
import { useSearchParams } from "react-router-dom"
import { RefreshCw } from "lucide-react"

export function SensitivityAnalysis() {
  const [searchParams] = useSearchParams()
  const expId = searchParams.get("id") || localStorage.getItem("active_experiment_id") || "EXP-8472"

  const [loading, setLoading] = useState(true)
  const [selectedParam, setSelectedParam] = useState<string>("All")
  const [availableParams, setAvailableParams] = useState<string[]>([])
  const [chartData, setChartData] = useState<any[]>(fallbackData)
  const [scores, setScores] = useState({
    securitySp: 0.48,
    runtimeSp: 1.25,
    errorSp: 5.80,
    memorySp: 0.02
  })

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || ""
    setLoading(true)

    fetch(`${apiUrl}/api/experiments/${expId}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then(data => {
        if (data.mutations && data.mutations.length > 0) {
          // Extract unique parameters
          const params = Array.from(new Set(data.mutations.map((m: any) => m.parameter))) as string[]
          setAvailableParams(params)
          if (!params.includes(selectedParam) && selectedParam !== "All") {
            setSelectedParam(params[0] || "All")
          }

          // Filter by selected parameter
          const filtered = (selectedParam === "All")
            ? data.mutations
            : data.mutations.filter((m: any) => m.parameter === selectedParam)

          const points = filtered.map((m: any) => {
            const rawPct = m.mutation_percent || "0%"
            const num = parseFloat(rawPct.replace("%", "").replace("+", "")) || 0
            return {
              perturbation: num,
              security: m.result ? m.result.security_estimate : 195.0,
              executionTime: m.result ? m.result.encap_time : 0.15,
              correctness: m.result ? m.result.correctness : 100.0,
              param: m.parameter
            }
          })

          // Add baseline point (0%) if not present
          if (!points.some((p: any) => p.perturbation === 0)) {
            points.push({
              perturbation: 0,
              security: 195.0,
              executionTime: 0.15,
              correctness: 100.0,
              param: "Baseline"
            })
          }

          points.sort((a: any, b: any) => a.perturbation - b.perturbation)
          setChartData(points)

          // Calculate sensitivity scores Sp
          const nonZero = points.filter((p: any) => p.perturbation !== 0)
          if (nonZero.length > 0) {
            const baseSec = 195.0
            const baseTime = 0.15
            let totalSecSp = 0
            let totalTimeSp = 0
            let totalErrSp = 0

            nonZero.forEach((p: any) => {
              const deltaPFrac = p.perturbation / 100.0
              const deltaSecFrac = (p.security - baseSec) / baseSec
              const deltaTimeFrac = (p.executionTime - baseTime) / baseTime
              const errRate = Math.max(0, 100.0 - p.correctness)

              totalSecSp += Math.abs(deltaSecFrac / deltaPFrac)
              totalTimeSp += Math.abs(deltaTimeFrac / deltaPFrac)
              totalErrSp += Math.abs(errRate / (Math.abs(deltaPFrac) * 100.0))
            })

            setScores({
              securitySp: Number((totalSecSp / nonZero.length).toFixed(2)),
              runtimeSp: Number((totalTimeSp / nonZero.length).toFixed(2)),
              errorSp: Number((totalErrSp / nonZero.length).toFixed(2)),
              memorySp: 0.02
            })
          }
        }
      })
      .catch(err => {
        console.warn("Using fallback sensitivity data:", err)
      })
      .finally(() => setLoading(false))
  }, [expId, selectedParam])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sensitivity Analysis</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Visualization of parameter perturbation vs cryptographic and performance metrics for {expId}.
          </p>
        </div>
        {availableParams.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Filter Parameter:</span>
            <select
              value={selectedParam}
              onChange={e => setSelectedParam(e.target.value)}
              className="text-xs h-8 border border-gray-300 rounded px-2 bg-white"
            >
              <option value="All">All Parameters</option>
              {availableParams.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Parameter Perturbation vs Estimated Security</CardTitle>
              {loading && <RefreshCw className="h-3.5 w-3.5 text-gray-400 animate-spin" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="perturbation" label={{ value: 'Parameter Change (%)', position: 'bottom', offset: 0 }} tick={{fontSize: 12}} />
                  <YAxis label={{ value: 'Estimated Security (bits)', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle'} }} tick={{fontSize: 12}} domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} />
                  <ReferenceLine x={0} stroke="#9ca3af" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="security" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Parameter Perturbation vs Execution Time</CardTitle>
              {loading && <RefreshCw className="h-3.5 w-3.5 text-gray-400 animate-spin" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="perturbation" label={{ value: 'Parameter Change (%)', position: 'bottom', offset: 0 }} tick={{fontSize: 12}} />
                  <YAxis label={{ value: 'Execution Time (ms)', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle'} }} tick={{fontSize: 12}} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} />
                  <ReferenceLine x={0} stroke="#9ca3af" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="executionTime" stroke="#4b5563" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sensitivity Score (S_p)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
              <div className="text-center font-mono text-lg mb-2">
                S_p = (ΔM / M) / (Δp / p)
              </div>
              <p className="text-sm text-center text-gray-600">
                Normalized elasticity: ratio of proportional metric change to proportional parameter perturbation.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-center">
              <div>
                <div className="text-xs text-gray-500 mb-1">Security Sensitivity S_sec</div>
                <div className="text-lg font-mono font-medium text-blue-700">{scores.securitySp}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Runtime Sensitivity S_time</div>
                <div className="text-lg font-mono font-medium">{scores.runtimeSp}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Error Rate Sensitivity S_err</div>
                <div className="text-lg font-mono font-medium text-amber-600">{scores.errorSp}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Memory Sensitivity S_mem</div>
                <div className="text-lg font-mono font-medium text-gray-500">{scores.memorySp}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

