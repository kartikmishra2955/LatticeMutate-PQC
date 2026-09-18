import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { sensitivityData } from "../data/mockData"

export function SensitivityAnalysis() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Sensitivity Analysis</h2>
        <p className="text-gray-500 mt-2">
          Visualization of parameter perturbation vs cryptographic and performance metrics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-center">Parameter Perturbation vs Estimated Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensitivityData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
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
            <CardTitle className="text-sm font-medium text-center">Parameter Perturbation vs Execution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensitivityData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
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
                Where <strong>p</strong> is the cryptographic parameter and <strong>M</strong> is the measured metric.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-center">
              <div>
                <div className="text-xs text-gray-500 mb-1">Security Estimate S_q</div>
                <div className="text-lg font-mono font-medium">0.48</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Runtime S_q</div>
                <div className="text-lg font-mono font-medium">1.25</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Error Rate S_q</div>
                <div className="text-lg font-mono font-medium">5.80</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Memory S_q</div>
                <div className="text-lg font-mono font-medium">0.02</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
