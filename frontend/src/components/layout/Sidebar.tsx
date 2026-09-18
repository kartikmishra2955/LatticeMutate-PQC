import React from "react"
import { NavLink } from "react-router-dom"
import { LayoutDashboard, PlusCircle, FlaskConical, BarChart2, Activity, List, LineChart, Download } from "lucide-react"

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

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <span className="text-sm font-semibold tracking-tight text-gray-900">LatticeMutate-PQC</span>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
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
            <span className="text-xs text-gray-500">v0.1.0-alpha</span>
          </div>
        </div>
      </div>
    </div>
  )
}
