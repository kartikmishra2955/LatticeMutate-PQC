import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Download, FileJson, FileText, BarChart2, Database } from "lucide-react"

export function Export() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Export Data</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Export experiment configuration, results, and research artifacts for external analysis and reproducibility.
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
              <Button variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
              <Button variant="outline" className="flex-1">
                <FileJson className="mr-2 h-4 w-4" /> JSON
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
            <Button variant="outline" className="w-full">
              <FileJson className="mr-2 h-4 w-4" /> Export Config JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart2 className="h-5 w-5 text-gray-500" />
              <CardTitle>Visualizations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Export charts and sensitivity heatmaps for inclusion in research papers.</p>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" /> Export SVG/PNG
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <CardTitle>Research Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Generate a structured LaTeX or Markdown report of the experiment's findings.</p>
            <Button variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" /> Generate Report
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
              <span className="font-mono text-xs">ML-KEM-768</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Seed</span>
              <span className="font-mono text-xs">0x4f8a9b21</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Trials</span>
              <span className="font-mono text-xs">100</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Timestamp</span>
              <span className="font-mono text-xs">2026-09-17T12:00:00Z</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">LatticeMutate Ver</span>
              <span className="font-mono text-xs">v0.1.0-alpha</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">NIST FIPS</span>
              <span className="font-mono text-xs">203</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
