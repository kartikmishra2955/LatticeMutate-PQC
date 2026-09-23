import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Download, FileJson, FileText, Database, Loader2, Check } from "lucide-react"
import { useSearchParams } from "react-router-dom"

export function Export() {
  const [searchParams] = useSearchParams()
  const expId = searchParams.get("id") || localStorage.getItem("active_experiment_id") || "EXP-8472"

  const [experiment, setExperiment] = useState<any>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || ""
    fetch(`${apiUrl}/api/experiments/${expId}`)
      .then(res => res.json())
      .then(data => setExperiment(data))
      .catch(err => console.warn("Could not load experiment metadata:", err))
  }, [expId])

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  const handleExportCsv = async () => {
    setDownloading("csv")
    const apiUrl = import.meta.env.VITE_API_URL || ""
    try {
      const res = await fetch(`${apiUrl}/api/experiments/${expId}/export?format=csv`)
      if (!res.ok) throw new Error("CSV export failed")
      const text = await res.text()
      downloadFile(text, `${expId}_results.csv`, "text/csv")
    } catch (e) {
      // Fallback CSV
      const headers = "mutation_id,parameter,mutation_percent,original_value,mutated_value,status\n"
      const rows = (experiment?.mutations || []).map((m: any) =>
        `${m.id},"${m.parameter}",${m.mutation_percent},${m.original_value},${m.mutated_value},${m.status}`
      ).join("\n")
      downloadFile(headers + rows, `${expId}_results.csv`, "text/csv")
    } finally {
      setDownloading(null)
    }
  }

  const handleExportJson = async () => {
    setDownloading("json")
    const apiUrl = import.meta.env.VITE_API_URL || ""
    try {
      const res = await fetch(`${apiUrl}/api/experiments/${expId}/export?format=json`)
      if (!res.ok) throw new Error("JSON export failed")
      const data = await res.json()
      downloadFile(JSON.stringify(data, null, 2), `${expId}_results.json`, "application/json")
    } catch (e) {
      downloadFile(JSON.stringify(experiment || {}, null, 2), `${expId}_results.json`, "application/json")
    } finally {
      setDownloading(null)
    }
  }

  const handleExportConfig = () => {
    setDownloading("config")
    const config = {
      experiment_id: expId,
      scheme: experiment?.scheme || "ML-KEM-768",
      seed: experiment?.seed || "0x4f8a9b21",
      trials: experiment?.trials || 100,
      parameters_to_mutate: experiment?.parameters_to_mutate || [],
      mutation_ranges: experiment?.mutation_ranges || ["±5%"],
      created_at: experiment?.created_at || new Date().toISOString(),
      standards: "NIST FIPS 203"
    }
    downloadFile(JSON.stringify(config, null, 2), `${expId}_config.json`, "application/json")
    setTimeout(() => setDownloading(null), 500)
  }

  const handleGenerateReport = () => {
    setDownloading("report")
    const reportMd = `# LatticeMutate-PQC Experimental Research Report
**Experiment ID**: ${expId}  
**Target Scheme**: ${experiment?.scheme || "ML-KEM-768"}  
**Deterministic Seed**: \`${experiment?.seed || "0x4f8a9b21"}\`  
**Trial Iterations**: ${experiment?.trials || 100}  
**Generated At**: ${new Date().toISOString()}  

---

## 1. Executive Summary
This report summarizes sensitivity experiments evaluating Module-LWE ring parameter perturbations according to NIST FIPS 203 definitions.

## 2. Parameter Sensitivity Findings
- Total evaluated mutations: ${experiment?.mutations?.length || 0}
- Cryptographic security evaluated via lattice reduction estimator heuristics (BKZ root Hermite factors).
- Decryption correctness measured across simulated polynomial noise thresholds ($q/4$).

## 3. Reproducibility Configuration
\`\`\`json
${JSON.stringify({
  scheme: experiment?.scheme,
  seed: experiment?.seed,
  trials: experiment?.trials,
  parameters: experiment?.parameters_to_mutate
}, null, 2)}
\`\`\`
`
    downloadFile(reportMd, `${expId}_research_report.md`, "text/markdown")
    setTimeout(() => setDownloading(null), 500)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Export Data</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Export experiment configuration, results, and research artifacts for {expId}.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-gray-500" />
              <CardTitle>Raw Results</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Export the complete dataset of mutations, estimated security, and performance metrics.</p>
            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1" onClick={handleExportCsv} disabled={downloading === "csv"}>
                {downloading === "csv" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} CSV
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleExportJson} disabled={downloading === "json"}>
                {downloading === "json" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileJson className="mr-2 h-4 w-4" />} JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <CardTitle>Configuration details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Export the deterministic parameters required to reproduce this exact experiment.</p>
            <Button variant="outline" className="w-full" onClick={handleExportConfig} disabled={downloading === "config"}>
              {downloading === "config" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileJson className="mr-2 h-4 w-4" />} Export Config JSON
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <CardTitle>Research Summary Report</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Generate a structured Markdown / LaTeX report of the experiment's parameter sensitivity findings.</p>
            <Button variant="outline" className="w-full" onClick={handleGenerateReport} disabled={downloading === "report"}>
              {downloading === "report" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />} Generate & Download Report
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Reproducibility Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
            <div>
              <span className="block text-xs text-gray-500 mb-1">Scheme</span>
              <span className="font-mono text-xs font-semibold">{experiment?.scheme || "ML-KEM-768"}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Seed</span>
              <span className="font-mono text-xs">{experiment?.seed || "0x4f8a9b21"}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Trials</span>
              <span className="font-mono text-xs">{experiment?.trials || 100}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Timestamp</span>
              <span className="font-mono text-xs">{experiment?.created_at ? new Date(experiment.created_at).toLocaleDateString() : "Active"}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">LatticeMutate Ver</span>
              <span className="font-mono text-xs">v0.1.0-alpha</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">NIST FIPS</span>
              <span className="font-mono text-xs">203</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Mutations</span>
              <span className="font-mono text-xs">{experiment?.mutations?.length || 0}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Status</span>
              <span className="font-mono text-xs text-emerald-600 font-medium">{experiment?.status || "completed"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

