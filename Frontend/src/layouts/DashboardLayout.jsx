import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'

/**
 * DashboardLayout
 *
 * Provides the shell that wraps every authenticated page:
 *   ┌─────────────────────────────────┐
 *   │  Sidebar  │  TopNavbar          │
 *   │  (fixed)  ├─────────────────────│
 *   │           │  <Outlet />         │
 *   │           │  (scrollable)       │
 *   └─────────────────────────────────┘
 *
 * On mobile the sidebar is hidden and toggled via the hamburger button
 * in the TopNavbar.
 */
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main column: navbar + scrollable content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-0">
        <TopNavbar onMenuClick={() => setSidebarOpen((v) => !v)} />

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden relative"
          aria-label="Page content"
        >
          <div className="flex flex-col h-full max-w-7xl mx-auto px-4 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
