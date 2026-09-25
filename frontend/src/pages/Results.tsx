import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { recentResults as fallbackResults } from "../data/mockData"
import { Download, Loader2, RefreshCw, Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import { useSearchParams, useNavigate } from "react-router-dom"

export function Results() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const expId = searchParams.get("id") || localStorage.getItem("active_experiment_id") || "EXP-8472"

  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [experiment, setExperiment] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])

  // State for AI corrections dropdown
  const [showCorrections, setShowCorrections] = useState(false)
  const [fetchingCorrections, setFetchingCorrections] = useState(false)
  const [corrections, setCorrections] = useState<string[]>([])

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || ""
    setLoading(true)

    fetch(`${apiUrl}/api/experiments/${expId}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then(data => {
        setExperiment(data)
        if (data.mutations && data.mutations.length > 0) {
          const mapped = data.mutations.map((m: any) => ({
            id: m.id,
            parameter: m.parameter,
            change: m.mutation_percent,
            securityEstimate: m.result ? `${m.result.security_estimate} bits` : "N/A",
            correctness: m.result ? `${m.result.correctness}%` : "100%",
            keyGen: m.result ? `${m.result.keygen_time}ms` : "0.12ms",
            encapsulation: m.result ? `${m.result.encap_time}ms` : "0.15ms",
            decapsulation: m.result ? `${m.result.decap_time}ms` : "0.18ms",
            regression: m.result ? m.result.regression : false
          }))
          setResults(mapped)
        } else {
          setResults(fallbackResults)
        }
      })
      .catch(err => {
        console.warn("Backend unavailable, using fallback mock results:", err)
        setResults(fallbackResults)
      })
      .finally(() => setLoading(false))
  }, [expId])

  const handleExportCsv = async () => {
    setExporting(true)
    const apiUrl = import.meta.env.VITE_API_URL || ""
    try {
      const res = await fetch(`${apiUrl}/api/experiments/${expId}/export?format=csv`)
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${expId}_results.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.warn("Direct CSV export failed, generating from client data:", e)
      const headers = "Mutation,Parameter,Change,Security Estimate,Correctness,KeyGen,Encap,Decap,Regression\n"
      const rows = results.map(r => `${r.id},"${r.parameter}",${r.change},${r.securityEstimate},${r.correctness},${r.keyGen},${r.encapsulation},${r.decapsulation},${r.regression}`).join("\n")
      const blob = new Blob([headers + rows], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${expId}_results.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const toggleCorrections = async () => {
    if (showCorrections) {
      setShowCorrections(false)
      return
    }

    setShowCorrections(true)
    if (corrections.length > 0) return // already fetched

    setFetchingCorrections(true)
    const apiUrl = import.meta.env.VITE_API_URL || ""
    try {
      const res = await fetch(`${apiUrl}/api/experiments/${expId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "correction" })
      })
      if (!res.ok) throw new Error("Failed to fetch corrections")
      const data = await res.json()
      setCorrections(data.details || [])
    } catch (e) {
      console.warn("Fallback corrections:", e)
      setCorrections([
        "• k is too small. Use k=3 for standard 192-bit security.",
        "• Noise η is cryptographically unsafe. Restore to η=2.",
        "• Modulus q breaks NTT performance. Revert to q=3329."
      ])
    } finally {
      setFetchingCorrections(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Experiment Results</h2>
          <p className="text-gray-500 mt-2 text-sm font-mono">
            Dataset: {expId} | Scheme: {experiment?.scheme || "ML-KEM-768"} | Seed: {experiment?.seed || "0x4f8a9b21"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/experiments")}>
            All Experiments
          </Button>
          <Button variant="default" onClick={handleExportCsv} disabled={exporting}>
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mutation Summary ({results.length} evaluated)</CardTitle>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleCorrections}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Suggest Corrections
                {showCorrections ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
              </Button>
              {loading && <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />}
            </div>
          </div>
        </CardHeader>
        
        {/* Corrections Dropdown Section */}
        {showCorrections && (
          <div className="px-6 py-4 bg-blue-50/50 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Parameter Corrections
            </h4>
            {fetchingCorrections ? (
              <div className="flex items-center text-sm text-gray-500">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing regressions...
              </div>
            ) : (
              <ul className="space-y-2 text-sm text-gray-700">
                {corrections.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <CardContent className={showCorrections ? "pt-6" : ""}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mutation</TableHead>
                <TableHead>Parameter</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Security Estimate</TableHead>
                <TableHead>Correctness</TableHead>
                <TableHead>KeyGen</TableHead>
                <TableHead>Encap</TableHead>
                <TableHead>Decap</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-mono text-xs">{result.id}</TableCell>
                  <TableCell className="font-mono">{result.parameter}</TableCell>
                  <TableCell className="font-medium">{result.change}</TableCell>
                  <TableCell>
                    <span className={result.regression ? "text-red-600 font-semibold" : "font-mono"}>
                      {result.securityEstimate}
                    </span>
                  </TableCell>
                  <TableCell>
                    {result.correctness === "100%" || result.correctness === "100.0%" ? (
                      <span className="text-emerald-600 font-medium">{result.correctness}</span>
                    ) : (
                      <Badge variant="danger">{result.correctness}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-600">{result.keyGen}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-600">{result.encapsulation}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-600">{result.decapsulation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

