"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { 
  Calendar, 
  Users, 
  ClipboardList, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Sparkles,
  RefreshCw,
  Package,
  MessageSquare,
  ExternalLink,
  LayoutDashboard,
  BookOpen
} from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/jobs", label: "Jobs", icon: ClipboardList },
  { href: "/booking-requests", label: "Booking Requests", icon: BookOpen },
  { href: "/recurring", label: "Recurring Jobs", icon: RefreshCw },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/supplies", label: "Supplies", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { signOut, user } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-8 border-b border-slate-200">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">C</div>
                <div className="text-lg font-bold text-slate-900">CLEAN REPORT</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden hover:bg-slate-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-8 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* External Links */}
          <div className="px-6 py-4 border-t border-slate-200">
            <div className="space-y-2">
              <Link
                href="/booking/demo"
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
                target="_blank"
                onClick={() => setSidebarOpen(false)}
              >
                <ExternalLink className="h-5 w-5 mr-3" />
                Booking Portal
              </Link>
              <Link
                href="/feedback/demo"
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
                target="_blank"
                onClick={() => setSidebarOpen(false)}
              >
                <MessageSquare className="h-5 w-5 mr-3" />
                Feedback Form
              </Link>
            </div>
          </div>

          {/* Sign out */}
          <div className="p-6 border-t border-slate-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-2">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-900">Clean Report</span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
            </div>
            <div className="flex items-center">
              <Link href="/settings">
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 rounded-lg p-2 transition-colors">
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">J</span>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Jonathan</div>
                    <div className="text-sm text-slate-600">jonathan@gmail.com</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 