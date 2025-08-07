"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTierAccess } from "@/lib/tier-access"
import { FeatureUpgradePrompt } from "@/lib/tier-access"
import { ChatInterface } from "@/components/messaging/chat-interface"
import { MessageSquare, Users, Clock, TrendingUp } from "lucide-react"

export default function MessagingPage() {
  const { access, userRole } = useTierAccess()

  // Sub contractors shouldn't see this page at all
  if (userRole === 'sub_contractor') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Messaging</h1>
          <p className="text-muted-foreground">
            Access denied. Messaging is only available to administrators.
          </p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Access Restricted
            </h3>
            <p className="text-gray-600">
              Messaging is only available to account administrators. 
              Please contact your administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Free users see upgrade prompts
  if (!access.messaging) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Messaging</h1>
          <p className="text-muted-foreground">
            Upgrade to Pro to unlock real-time messaging with your sub contractors.
          </p>
        </div>

        <FeatureUpgradePrompt
          feature="messaging"
          title="Real-Time Messaging"
          description="Communicate instantly with your sub contractors through secure, real-time messaging."
        />

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Instant Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Send messages, photos, and updates in real-time with your team.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Keep everyone connected and informed about job progress.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Job-Specific Chats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Organize conversations by job for better project management.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Why Upgrade to Pro?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Real-time communication</h4>
                  <p className="text-sm text-gray-600">
                    Instant messaging with your sub contractors for better coordination
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">File sharing</h4>
                  <p className="text-sm text-gray-600">
                    Share photos, documents, and updates directly in chat
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Job-specific conversations</h4>
                  <p className="text-sm text-gray-600">
                    Organize discussions by job for better project management
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Pro users see the full messaging interface
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messaging</h1>
        <p className="text-muted-foreground">
          Communicate with your sub contractors in real-time.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Chats</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-red-600">8</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online Team</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Messages</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messaging Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Team Communication
          </CardTitle>
          <CardDescription>
            Real-time messaging with your sub contractors. Share updates, photos, and coordinate jobs efficiently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChatInterface />
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Messaging Features</CardTitle>
          <CardDescription>
            Everything you need to stay connected with your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold">Real-time Communication</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Instant messaging with sub contractors</li>
                <li>• File and photo sharing</li>
                <li>• Read receipts and typing indicators</li>
                <li>• Message history and search</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Job Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Job-specific conversation threads</li>
                <li>• Task assignment and updates</li>
                <li>• Progress tracking and photos</li>
                <li>• Client communication logs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 