"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { useTierAccess } from "@/lib/tier-access"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchComponent } from "@/components/ui/search"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { Avatar, AvatarFallback, getAvatarFallback, getAvatarColorClasses } from "@/components/ui/avatar"
import { Logo } from "@/components/ui/logo"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  MessageSquare,
  Building2,
  Plus,
  ChevronDown,
  User,
  HelpCircle,
  ExternalLink,
  Package,
  Repeat,
  BarChart3
} from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { access, userRole } = useTierAccess()
  useKeyboardShortcuts()

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Base menu items for all users
  const baseMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/jobs", label: "Jobs", icon: FileText },
    { href: "/supplies", label: "Supplies", icon: Package },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  // Build menu items based on user role and tier access
  const getMenuItems = () => {
    const items = [...baseMenuItems]
    
    // Only show Pro features to admin users (not sub contractors)
    if (userRole === 'admin') {
      if (access.recurringJobs) {
        items.push({ href: "/recurring", label: "Recurring Jobs", icon: Calendar })
      }
      
      if (access.subContractors) {
        items.push({ href: "/sub-contractors", label: "Sub Contractors", icon: Users })
      }
      
      if (access.messaging) {
        items.push({ href: "/messaging", label: "Messaging", icon: MessageSquare })
      }
      
      if (access.aiFeatures) {
        items.push({ href: "/ai-tools", label: "AI Tools", icon: Sparkles })
      }
      
      if (access.xeroIntegration) {
        items.push({ href: "/integrations", label: "Integrations", icon: Building2 })
      }
    }
    
    return items
  }

  const menuItems = getMenuItems()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-xl transform transition-transform duration-300 ease-in-out border-r ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Logo size="md" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>



        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="bg-card/50 backdrop-blur-sm border-b shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Left side - Mobile menu and search */}
            <div className="flex items-center space-x-4 flex-1">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Search bar */}
              <div className="flex-1 max-w-md">
                <SearchComponent className="w-full" />
              </div>
            </div>

            {/* Right side - Notifications, user menu, and quick actions */}
            <div className="flex items-center space-x-4">
              {/* Quick Actions - only for admin users */}
              {userRole === 'admin' && (
                <div className="hidden sm:flex items-center space-x-2">
                  <Link href="/jobs/new">
                    <Button size="sm" variant="outline" className="flex items-center space-x-1">
                      <Plus className="w-4 h-4" />
                      <span>New Job</span>
                    </Button>
                  </Link>
                  <Link href="/clients/new">
                    <Button size="sm" variant="outline" className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>Add Client</span>
                    </Button>
                  </Link>
                </div>
              )}

              {/* Notifications */}
              <NotificationsDropdown />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={getAvatarColorClasses(user?.email)}>
                      {getAvatarFallback(undefined, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-foreground">
                      {user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {userRole === 'admin' ? 'Administrator' : 'Sub Contractor'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 crm-card z-50 overflow-hidden">
                    {/* User Info Header */}
                    <div className="px-4 py-3 bg-muted/50 border-b">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className={getAvatarColorClasses(user?.email)}>
                            {getAvatarFallback(undefined, user?.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {user?.email?.split('@')[0]}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {userRole === 'admin' ? 'Administrator' : 'Sub Contractor'}
                          </p>
                          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3 text-muted-foreground" />
                        Profile Settings
                      </Link>
                      
                      <Link
                        href="/help"
                        className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <HelpCircle className="w-4 h-4 mr-3 text-muted-foreground" />
                        Help & Support
                      </Link>
                      
                      {userRole === 'admin' && (
                        <>
                          <Link
                            href="/reports"
                            className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <FileText className="w-4 h-4 mr-3 text-muted-foreground" />
                            My Reports
                          </Link>
                        </>
                      )}
                    </div>
                    
                    {/* Sign Out */}
                    <div className="border-t">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          handleSignOut()
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 space-y-6">
          {children}
        </main>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}


    </div>
  )
} 