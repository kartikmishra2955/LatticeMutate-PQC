import React from "react"
import { NavLink } from "react-router-dom"
import { LayoutDashboard, PlusCircle, FlaskConical, BarChart2, Activity, List, LineChart, Download, X } from "lucide-react"

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "New Experiment", href: "/new", icon: PlusCircle },
  { name: "Experiments", href: "/experiments", icon: FlaskConical },
  { name: "Results", href: "/results", icon: BarChart2 },
  { name: "Sensitivity Analysis", href: "/sensitivity", icon: Activity },
  { name: "Mutations", href: "/mutations", icon: List },
  { name: "Analysis", href: "/analysis", icon: LineChart },
  { name: "Export", href: "/export", icon: Download },
]

interface SidebarProps {
  isMobileOpen?: boolean
  onCloseMobile?: () => void
}

export function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const sidebarStyle = {
    backgroundColor: "var(--color-sidebar-bg)",
    borderColor: "var(--color-border)",
    transition: "background-color 0.3s ease",
  }

  const navContent = (
    <>
      <div
        className="flex h-14 items-center justify-between border-b px-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>
          LatticeMutate-PQC
        </span>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-md transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onCloseMobile}
              className="group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
              style={({ isActive }) => ({
                backgroundColor: isActive ? "var(--color-sidebar-active)" : "transparent",
                color: isActive ? "var(--color-sidebar-active-text)" : "var(--color-sidebar-text)",
                fontWeight: isActive ? "600" : "500",
              })}
            >
              <Icon className="mr-3 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {item.name}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t p-4" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)",
              color: "var(--color-primary)",
            }}
          >
            RM
          </div>
          <div className="ml-3 flex flex-col">
            <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>Research Mode</span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Android & PWA Ready</span>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop static sidebar */}
      <aside
        className="hidden md:flex h-full w-64 flex-col border-r flex-shrink-0"
        style={sidebarStyle}
      >
        {navContent}
      </aside>

      {/* Mobile drawer backdrop and slide-over */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside
            className="relative flex w-64 max-w-[80vw] flex-1 flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200"
            style={sidebarStyle}
          >
            {navContent}
          </aside>
        </div>
      )}
    </>
  )
}
