import React, { useState, useEffect } from "react"
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"
import { useLocation } from "react-router-dom"

export function Header() {
  const [online, setOnline] = useState<boolean | null>(null)
  const location = useLocation()

  // Extract experiment id if present in query params or localStorage
  const searchParams = new URLSearchParams(location.search)
  const queryExpId = searchParams.get("id")
  const activeExpId = queryExpId || localStorage.getItem("active_experiment_id") || "EXP-8472"

  useEffect(() => {
    if (queryExpId) {
      localStorage.setItem("active_experiment_id", queryExpId)
    }
  }, [queryExpId])

  const checkStatus = () => {
    const apiUrl = import.meta.env.VITE_API_URL || ""
    fetch(`${apiUrl}/api/status`)
      .then((res) => res.json())
      .then((data) => {
        setOnline(data.status === "ok")
      })
      .catch(() => setOnline(false))
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">Project Dashboard</h1>
        {online === true ? (
          <div className="flex items-center rounded-md bg-emerald-50 px-2.5 py-1 border border-emerald-200">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Backend Connected</span>
          </div>
        ) : online === false ? (
          <div className="flex items-center rounded-md bg-amber-50 px-2.5 py-1 border border-amber-200">
            <AlertCircle className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Offline / Demo Fallback</span>
          </div>
        ) : (
          <div className="flex items-center rounded-md bg-gray-50 px-2.5 py-1">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-gray-400 animate-spin" />
            <span className="text-xs font-medium text-gray-500">Checking API...</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500">
          Active Experiment: <span className="font-mono font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{activeExpId}</span>
        </div>
      </div>
    </header>
  )
}

