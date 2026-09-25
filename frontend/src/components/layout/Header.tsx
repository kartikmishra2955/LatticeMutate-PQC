import React, { useState, useEffect, useRef } from "react"
import { CheckCircle2, AlertCircle, RefreshCw, Menu, Palette, Sun, Moon, Sparkles, Leaf } from "lucide-react"
import { useLocation } from "react-router-dom"
import { useTheme } from "../../lib/ThemeContext"

interface HeaderProps {
  onToggleMenu?: () => void
}

const themes = [
  { id: "light",    label: "Light",    icon: Sun,      color: "#f9fafb", accent: "#2563eb" },
  { id: "dark",     label: "Dark",     icon: Moon,     color: "#13151a", accent: "#3b82f6" },
  { id: "midnight", label: "Midnight", icon: Sparkles, color: "#0a0812", accent: "#a78bfa" },
  { id: "forest",   label: "Forest",   icon: Leaf,     color: "#091410", accent: "#10b981" },
] as const

export function Header({ onToggleMenu }: HeaderProps) {
  const [online, setOnline] = useState<boolean | null>(null)
  const [themeOpen, setThemeOpen] = useState(false)
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const searchParams = new URLSearchParams(location.search)
  const queryExpId = searchParams.get("id")
  const activeExpId = queryExpId || localStorage.getItem("active_experiment_id") || "EXP-8472"

  useEffect(() => {
    if (queryExpId) {
      localStorage.setItem("active_experiment_id", queryExpId)
    }
  }, [queryExpId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setThemeOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

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

  const activeTheme = themes.find(t => t.id === theme) || themes[0]

  return (
    <header
      className="flex h-14 items-center justify-between px-3 sm:px-6 border-b"
      style={{
        backgroundColor: "var(--color-header-bg)",
        borderColor: "var(--color-header-border)",
      }}
    >
      <div className="flex items-center gap-2 sm:gap-4">
        {onToggleMenu && (
          <button
            onClick={onToggleMenu}
            className="md:hidden p-2 rounded-md focus:outline-none transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-base sm:text-lg font-semibold truncate" style={{ color: "var(--color-text)" }}>
          <span className="hidden sm:inline">Project </span>Dashboard
        </h1>

        {/* Status Badge */}
        {online === true ? (
          <div className="flex items-center rounded-md px-2 py-0.5 sm:px-2.5 sm:py-1 border"
            style={{ backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }}>
            <CheckCircle2 className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" style={{ color: "#059669" }} />
            <span className="text-[11px] sm:text-xs font-medium" style={{ color: "#065f46" }}>Online</span>
          </div>
        ) : online === false ? (
          <div className="flex items-center rounded-md px-2 py-0.5 sm:px-2.5 sm:py-1 border"
            style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}>
            <AlertCircle className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" style={{ color: "#d97706" }} />
            <span className="text-[11px] sm:text-xs font-medium" style={{ color: "#92400e" }}>Offline</span>
          </div>
        ) : (
          <div className="flex items-center rounded-md px-2 py-0.5" style={{ backgroundColor: "var(--color-border)" }}>
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" style={{ color: "var(--color-text-muted)" }} />
            <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>Checking...</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Active Experiment */}
        <div className="text-xs sm:text-sm" style={{ color: "var(--color-text-muted)" }}>
          <span className="hidden sm:inline">Active: </span>
          <span
            className="font-mono font-medium px-1.5 py-0.5 sm:px-2 rounded border text-xs"
            style={{
              color: "var(--color-primary)",
              backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-primary) 30%, transparent)",
            }}
          >
            {activeExpId}
          </span>
        </div>

        {/* Theme Picker */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setThemeOpen(prev => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all hover:scale-105"
            style={{
              backgroundColor: activeTheme.color,
              borderColor: activeTheme.accent,
              color: "var(--color-text)",
            }}
            title="Change theme"
          >
            <span
              className="inline-block w-3 h-3 rounded-full border"
              style={{ backgroundColor: activeTheme.accent, borderColor: "rgba(255,255,255,0.3)" }}
            />
            <span className="hidden sm:inline">{activeTheme.label}</span>
            <Palette className="h-3.5 w-3.5 opacity-70" />
          </button>

          {themeOpen && (
            <div
              className="absolute right-0 mt-2 w-44 rounded-xl border shadow-2xl z-50 overflow-hidden"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="p-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1" style={{ color: "var(--color-text-muted)" }}>
                  Choose Theme
                </p>
                {themes.map((t) => {
                  const Icon = t.icon
                  const isActive = theme === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setThemeOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: isActive ? "color-mix(in srgb, var(--color-primary) 15%, transparent)" : "transparent",
                        color: isActive ? "var(--color-primary)" : "var(--color-text)",
                      }}
                    >
                      {/* Color swatch */}
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 shrink-0"
                        style={{ backgroundColor: t.color, borderColor: t.accent }}
                      >
                        <Icon className="w-3 h-3" style={{ color: t.accent }} />
                      </span>
                      <span className="font-medium">{t.label}</span>
                      {isActive && (
                        <CheckCircle2 className="h-3.5 w-3.5 ml-auto" style={{ color: "var(--color-primary)" }} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}



