import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"

export function NewExperiment() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [scheme, setScheme] = useState("ML-KEM-768")
  const [seed, setSeed] = useState("0x4f8a9b21")
  const [trials, setTrials] = useState(100)
  const [selectedParams, setSelectedParams] = useState<string[]>(['Module Dimension (k)', 'Dimension (n)', 'Modulus (q)', 'Compression (du)', 'Compression (dv)', 'Noise (η1)', 'Noise (η2)'])
  const [mutationRange, setMutationRange] = useState("±5%")

  const allParams = ['Module Dimension (k)', 'Dimension (n)', 'Modulus (q)', 'Compression (du)', 'Compression (dv)', 'Noise (η1)', 'Noise (η2)']
  const allRanges = ['±1%', '±2%', '±5%', '±10%']

  const handleParamToggle = (param: string) => {
    setSelectedParams(prev => prev.includes(param) ? prev.filter(p => p !== param) : [...prev, param])
  }

  const handleRun = async () => {
    setLoading(true)
    try {
      // 1. Create Experiment
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const createRes = await fetch(`${apiUrl}/api/experiments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheme,
          seed,
          trials: Number(trials),
          parameters_to_mutate: selectedParams,
          mutation_ranges: [mutationRange]
        })
      })
      if (!createRes.ok) throw new Error("Failed to create experiment")
      const experiment = await createRes.json()
      
      localStorage.setItem("active_experiment_id", experiment.id)
      navigate(`/running?id=${experiment.id}`)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">New Experiment</h2>
        <p className="text-gray-500 mt-2">
          Configure a new parameter sensitivity experiment for ML-KEM.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">1. Baseline Scheme</h3>
            <select value={scheme} onChange={e => setScheme(e.target.value)} className="w-full max-w-md h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="ML-KEM-512">ML-KEM-512 (Category 1)</option>
              <option value="ML-KEM-768">ML-KEM-768 (Category 3)</option>
              <option value="ML-KEM-1024">ML-KEM-1024 (Category 5)</option>
            </select>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">2. Parameters to Mutate</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {allParams.map((param) => (
                <label key={param} className="flex items-center space-x-2 text-sm p-1 hover:bg-gray-50 rounded">
                  <input type="checkbox" checked={selectedParams.includes(param)} onChange={() => handleParamToggle(param)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span>{param}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">3. Mutation Range</h3>
            <div className="flex flex-wrap gap-4">
              {allRanges.map((range) => (
                <label key={range} className="flex items-center space-x-2 text-sm p-1 hover:bg-gray-50 rounded">
                  <input type="radio" name="mutation_range" checked={mutationRange === range} onChange={() => setMutationRange(range)} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span>{range}</span>
                </label>
              ))}
              <label className="flex items-center space-x-2 text-sm p-1">
                <input type="radio" name="mutation_range" checked={!allRanges.includes(mutationRange)} onChange={() => setMutationRange("")} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span>Custom:</span>
                <input type="text" placeholder="±%" value={allRanges.includes(mutationRange) ? "" : mutationRange} onChange={e => setMutationRange(e.target.value)} className="w-16 h-8 rounded-md border border-gray-300 px-2 text-xs" />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">4. Metrics to Measure</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {['Security estimation', 'Correctness', 'Key generation time', 'Encapsulation time', 'Decapsulation time', 'Memory usage'].map((metric) => (
                <label key={metric} className="flex items-center space-x-2 text-sm p-1 hover:bg-gray-50 rounded">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span>{metric}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">5. Reproducibility</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Random Seed</label>
                <input type="text" value={seed} onChange={e => setSeed(e.target.value)} className="h-9 rounded-md border border-gray-300 px-3 py-1 text-sm font-mono" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Number of Trials</label>
                <input type="number" value={trials} onChange={e => setTrials(Number(e.target.value))} className="h-9 rounded-md border border-gray-300 px-3 py-1 text-sm font-mono" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Experiment ID</label>
                <input type="text" value="Auto-generated" disabled className="h-9 rounded-md border border-gray-300 bg-gray-50 px-3 py-1 text-sm font-mono text-gray-500 cursor-not-allowed" />
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button size="lg" onClick={handleRun} disabled={loading} className="w-full sm:w-auto">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Run Experiment
        </Button>
      </div>
    </div>
  )
}
