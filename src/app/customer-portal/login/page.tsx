"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react"
import { loginCustomerPortal } from "@/lib/customer-portal-client"

function CustomerPortalLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState("")
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    // Check if client ID is provided in URL params (from QR code)
    const clientParam = searchParams.get('client')
    if (clientParam) {
      setClientId(clientParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await loginCustomerPortal(formData.email, formData.password)
      
      if (result.success) {
        // Store client session data
        sessionStorage.setItem('customer_portal_session', JSON.stringify({
          client_id: result.client_id,
          email: formData.email,
          loginTime: new Date().toISOString()
        }))
        
        toast({
          title: "Welcome back!",
          description: "Successfully logged into your customer portal."
        })
        
        router.push("/customer-portal/dashboard")
      } else {
        setError(result.error || "Invalid email or password")
      }
    } catch (error) {
      console.error('Login error:', error)
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
          </div>
          <p className="text-gray-600">Access your cleaning service information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Sign In
            </CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <div className="text-center text-sm text-gray-600">
                <p>Don't have an account?</p>
                <p className="mt-1">Contact your cleaning service provider to get access.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              <p className="font-medium mb-2">Need Help?</p>
              <p>If you're having trouble logging in or need access, please contact your cleaning service provider.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CustomerPortalLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading login page...</p>
        </div>
      </div>
    }>
      <CustomerPortalLoginForm />
    </Suspense>
  )
}