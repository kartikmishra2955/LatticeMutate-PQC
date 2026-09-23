import React, { useState, useEffect } from "react"
import { CheckCircle2, AlertCircle, RefreshCw, Menu } from "lucide-react"
import { useLocation } from "react-router-dom"

interface HeaderProps {
  onToggleMenu?: () => void
}

export function Header({ onToggleMenu }: HeaderProps) {
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
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        {onToggleMenu && (
          <button
            onClick={onToggleMenu}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
          <span className="hidden sm:inline">Project </span>Dashboard
        </h1>
        {online === true ? (
          <div className="flex items-center rounded-md bg-emerald-50 px-2 py-0.5 sm:px-2.5 sm:py-1 border border-emerald-200">
            <CheckCircle2 className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5 text-emerald-600" />
            <span className="text-[11px] sm:text-xs font-medium text-emerald-700">Online</span>
          </div>
        ) : online === false ? (
          <div className="flex items-center rounded-md bg-amber-50 px-2 py-0.5 sm:px-2.5 sm:py-1 border border-amber-200">
            <AlertCircle className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5 text-amber-600" />
            <span className="text-[11px] sm:text-xs font-medium text-amber-700">Offline</span>
          </div>
        ) : (
          <div className="flex items-center rounded-md bg-gray-50 px-2 py-0.5">
            <RefreshCw className="mr-1 h-3 w-3 text-gray-400 animate-spin" />
            <span className="text-[11px] text-gray-500">Checking...</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="text-xs sm:text-sm text-gray-500">
          <span className="hidden sm:inline">Active: </span>
          <span className="font-mono font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 sm:px-2 rounded border border-blue-200 text-xs">
            {activeExpId}
          </span>
        </div>
      </div>
    </header>
  )
}


