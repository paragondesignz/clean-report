"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Bot, User, Send, Loader2, MessageCircle } from "lucide-react"
import { getCustomerPortalSession, getClientJobs, getClientJobStats } from "@/lib/customer-portal-client"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function CustomerPortalChat() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize with welcome message
    if (!chatStarted) {
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: "Hi there! I'm your AI cleaning assistant. I can help you with questions about your cleaning services, scheduling, pricing, and more. What would you like to know?",
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
      setChatStarted(true)
    }
  }, [chatStarted])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Get user's session and job data for context
      const session = getCustomerPortalSession()
      let contextData = null
      
      if (session) {
        const [jobs, stats] = await Promise.all([
          getClientJobs(session.client_id, { limit: 10 }),
          getClientJobStats(session.client_id)
        ])
        contextData = { jobs, stats }
      }

      const response = await fetch('/api/customer-portal/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: contextData,
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      return data.response || "I apologize, but I'm having trouble processing your request right now. Please try contacting our support team directly."
    } catch (error) {
      console.error('Error generating AI response:', error)
      return "I'm sorry, I'm experiencing some technical difficulties. Please try again or contact our support team at (555) 123-4567 for immediate assistance."
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const aiResponse = await generateAIResponse(userMessage.content)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const startConversation = (topic: string) => {
    setInput(topic)
    handleSend()
  }

  const suggestedQuestions = [
    "How can I reschedule my next cleaning?",
    "What's included in my regular cleaning service?",
    "How do you calculate the final cost?",
    "Can I request specific cleaning tasks?",
    "What should I do to prepare for cleaning?"
  ]

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          AI Assistant
        </CardTitle>
        <CardDescription>
          Ask me anything about your cleaning services
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 text-xs"
                  onClick={() => startConversation(question)}
                >
                  {question}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about your cleaning services..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={loading || !input.trim()}
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  )
}