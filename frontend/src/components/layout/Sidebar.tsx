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
  const navContent = (
    <>
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
        <span className="text-sm font-semibold tracking-tight text-gray-900">LatticeMutate-PQC</span>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
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
              className={({ isActive }) =>
                `group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <Icon className="mr-3 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {item.name}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
            RM
          </div>
          <div className="ml-3 flex flex-col">
            <span className="text-sm font-medium text-gray-900">Research Mode</span>
            <span className="text-xs text-gray-500">Android & PWA Ready</span>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:flex h-full w-64 flex-col border-r border-gray-200 bg-white flex-shrink-0">
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
          <aside className="relative flex w-64 max-w-[80vw] flex-1 flex-col bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </aside>
        </div>
      )}
    </>
  )
}

