import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export function MainLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onToggleMenu={() => setIsMobileOpen(prev => !prev)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8 overscroll-contain">
          <div className="mx-auto max-w-6xl w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

