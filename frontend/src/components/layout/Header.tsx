import React from "react"
import { AlertCircle, Settings } from "lucide-react"

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">Project Dashboard</h1>
        <div className="flex items-center rounded-md bg-amber-50 px-2.5 py-1">
          <AlertCircle className="mr-2 h-4 w-4 text-amber-600" />
          <span className="text-xs font-medium text-amber-700">DEMO MODE — Experimental backend not connected</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500">
          Current Experiment: <span className="font-mono font-medium text-gray-900">EXP-8472</span>
        </div>
        <button className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
