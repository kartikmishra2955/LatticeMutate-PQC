import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { baselineMLKEM, experimentStats as fallbackStats } from "../data/mockData"
import { Badge } from "../components/ui/Badge"
import { Database, Shield, Zap, Activity } from "lucide-react"

export function Overview() {
  const [backendStatus, setBackendStatus] = useState<"Connected" | "Disconnected">("Disconnected")
  const [stats, setStats] = useState(fallbackStats)
  const [dataSource, setDataSource] = useState("Simulated (Mock)")

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || ''
    
    // Check status
    fetch(`${apiUrl}/api/status`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok") {
          setBackendStatus("Connected")
          setDataSource("SQLite Database (Live)")
          
          // Fetch stats
          fetch(`${apiUrl}/api/experiments/stats`)
            .then(res => res.json())
            .then(statsData => {
              if (statsData.totalExperiments > 0) {
                setStats(statsData)
              }
            })
            .catch(() => {})
        }
      })
      .catch(() => {
        setBackendStatus("Disconnected")
        setDataSource("Simulated (Mock)")
      })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Project Summary</h2>
        <p className="text-gray-500 mt-2">
          LatticeMutate-PQC is a mutation-based experimental framework for studying the sensitivity of lattice-based cryptographic parameters.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Experiments</CardTitle>
            <Database className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExperiments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mutations Tested</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mutationsTested.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Estimates</CardTitle>
            <Shield className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.securityEstimates.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Flagged Regressions</CardTitle>
            <Zap className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.flaggedRegressions}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Baseline Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Scheme</span>
                <span className="font-mono text-sm font-semibold">{baselineMLKEM.scheme}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Security Category</span>
                <Badge>Category {baselineMLKEM.securityCategory}</Badge>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold mb-3">Mathematical Parameters</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Module Dimension (k)</span>
                    <span className="font-mono text-sm">{baselineMLKEM.k}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Dimension (n)</span>
                    <span className="font-mono text-sm">{baselineMLKEM.n}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Modulus (q)</span>
                    <span className="font-mono text-sm">{baselineMLKEM.q}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Compression (du)</span>
                    <span className="font-mono text-sm">{baselineMLKEM.du}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Compression (dv)</span>
                    <span className="font-mono text-sm">{baselineMLKEM.dv}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Noise Parameter (η1)</span>
                    <span className="font-mono text-sm">{baselineMLKEM.eta1}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Noise Parameter (η2)</span>
                    <span className="font-mono text-sm">{baselineMLKEM.eta2}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <div className="flex items-center justify-between text-sm">
                 <span className="text-gray-500">Backend Status</span>
                 <Badge variant={backendStatus === "Connected" ? "success" : "warning"}>{backendStatus}</Badge>
               </div>
               <div className="flex items-center justify-between text-sm">
                 <span className="text-gray-500">Data Source</span>
                 <span className="font-mono text-xs">{dataSource}</span>
               </div>
               <div className="flex items-center justify-between text-sm">
                 <span className="text-gray-500">Core Framework</span>
                 <span className="font-mono text-xs">ML-KEM (NIST FIPS 203)</span>
               </div>
               <div className="mt-4 rounded-md bg-gray-50 p-4 border border-gray-200">
                 <p className="text-xs text-gray-600">
                   <strong>Note:</strong> LatticeMutate-PQC relies on NIST FIPS 203 for algorithm definitions and the Lattice Estimator for security estimates. Results presented are experimental estimates, not mathematical proofs.
                 </p>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

