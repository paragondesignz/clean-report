"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { 
  Send, 
  Paperclip, 
  Image, 
  File, 
  Phone, 
  Video, 
  MoreHorizontal,
  Search,
  Filter,
  Archive,
  Trash2,
  Pin,
  Reply,
  Forward,
  Mic,
  Camera,
  MessageSquare
} from "lucide-react"

interface Message {
  id: string
  sender_id: string
  sender_name: string
  sender_type: 'admin' | 'sub_contractor'
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  job_id?: string
  timestamp: string
  is_read: boolean
  attachments?: MessageAttachment[]
  reply_to?: string
}

interface MessageAttachment {
  id: string
  name: string
  type: 'image' | 'file'
  url: string
  size: number
}

interface ChatParticipant {
  id: string
  name: string
  type: 'admin' | 'sub_contractor'
  avatar?: string
  is_online: boolean
  last_seen: string
}

interface ChatThread {
  id: string
  participants: ChatParticipant[]
  last_message?: Message
  unread_count: number
  job_id?: string
  created_at: string
  updated_at: string
}

export function ChatInterface() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null)
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAttachments, setShowAttachments] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Simulate loading chat data
    setTimeout(() => {
      const mockThreads: ChatThread[] = [
        {
          id: '1',
          participants: [
            { id: 'admin1', name: 'Mike Admin', type: 'admin', is_online: true, last_seen: new Date().toISOString() },
            { id: 'sub1', name: 'Sarah Johnson', type: 'sub_contractor', is_online: false, last_seen: new Date(Date.now() - 300000).toISOString() }
          ],
          last_message: {
            id: 'msg1',
            sender_id: 'sub1',
            sender_name: 'Sarah Johnson',
            sender_type: 'sub_contractor',
            content: 'Just finished the kitchen cleaning. Photos uploaded.',
            message_type: 'text',
            timestamp: new Date(Date.now() - 60000).toISOString(),
            is_read: true
          },
          unread_count: 0,
          job_id: 'job1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          participants: [
            { id: 'admin1', name: 'Mike Admin', type: 'admin', is_online: true, last_seen: new Date().toISOString() },
            { id: 'sub2', name: 'Mike Chen', type: 'sub_contractor', is_online: true, last_seen: new Date().toISOString() }
          ],
          last_message: {
            id: 'msg2',
            sender_id: 'admin1',
            sender_name: 'Mike Admin',
            sender_type: 'admin',
            content: 'New job assigned for tomorrow at 9 AM',
            message_type: 'text',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            is_read: false
          },
          unread_count: 1,
          job_id: 'job2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      const mockMessages: Message[] = [
        {
          id: '1',
          sender_id: 'admin1',
          sender_name: 'Mike Admin',
          sender_type: 'admin',
          content: 'Hi Sarah, you have a new job assignment for the Johnson residence.',
          message_type: 'text',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          is_read: true
        },
        {
          id: '2',
          sender_id: 'sub1',
          sender_name: 'Sarah Johnson',
          sender_type: 'sub_contractor',
          content: 'Thanks Mike! I can see the job details. What time should I start?',
          message_type: 'text',
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          is_read: true
        },
        {
          id: '3',
          sender_id: 'admin1',
          sender_name: 'Mike Admin',
          sender_type: 'admin',
          content: 'The client prefers 9 AM. Please start the timer when you arrive.',
          message_type: 'text',
          timestamp: new Date(Date.now() - 3400000).toISOString(),
          is_read: true
        },
        {
          id: '4',
          sender_id: 'sub1',
          sender_name: 'Sarah Johnson',
          sender_type: 'sub_contractor',
          content: 'Perfect! I\'ll be there at 9 AM sharp.',
          message_type: 'text',
          timestamp: new Date(Date.now() - 3300000).toISOString(),
          is_read: true
        },
        {
          id: '5',
          sender_id: 'sub1',
          sender_name: 'Sarah Johnson',
          sender_type: 'sub_contractor',
          content: 'Just finished the kitchen cleaning. Photos uploaded.',
          message_type: 'text',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          is_read: true
        }
      ]

      setThreads(mockThreads)
      setCurrentThread(mockThreads[0])
      setMessages(mockMessages)
    }, 1000)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return

    const message: Message = {
      id: Date.now().toString(),
      sender_id: 'admin1', // In real app, this would be the current user's ID
      sender_name: 'Mike Admin',
      sender_type: 'admin',
      content: newMessage,
      message_type: 'text',
      timestamp: new Date().toISOString(),
      is_read: false
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    setSelectedFiles([])
    setShowAttachments(false)

    // Simulate typing indicator
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      // Simulate reply
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        sender_id: 'sub1',
        sender_name: 'Sarah Johnson',
        sender_type: 'sub_contractor',
        content: 'Got it! I\'ll update you when I\'m done.',
        message_type: 'text',
        timestamp: new Date().toISOString(),
        is_read: false
      }
      setMessages(prev => [...prev, reply])
    }, 2000)

    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully",
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setSelectedFiles(prev => [...prev, ...imageFiles])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredThreads = threads.filter(thread =>
    thread.participants.some(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Threads Sidebar */}
      <div className="w-80 border-r bg-gray-50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button size="sm" variant="outline">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto h-[calc(600px-80px)]">
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors ${
                currentThread?.id === thread.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => setCurrentThread(thread)}
            >
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={thread.participants[1]?.avatar} />
                  <AvatarFallback>
                    {thread.participants[1]?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm truncate">
                      {thread.participants[1]?.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {thread.unread_count > 0 && (
                        <Badge className="h-5 w-5 p-0 text-xs">
                          {thread.unread_count}
                        </Badge>
                      )}
                      <div className={`w-2 h-2 rounded-full ${
                        thread.participants[1]?.is_online ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    </div>
                  </div>
                  {thread.last_message && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {thread.last_message.content}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {thread.last_message ? formatTime(thread.last_message.timestamp) : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentThread ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentThread.participants[1]?.avatar} />
                    <AvatarFallback>
                      {currentThread.participants[1]?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{currentThread.participants[1]?.name}</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        currentThread.participants[1]?.is_online ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-sm text-gray-600">
                        {currentThread.participants[1]?.is_online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${message.sender_type === 'admin' ? 'order-2' : 'order-1'}`}>
                    <div className={`rounded-lg px-4 py-2 ${
                      message.sender_type === 'admin'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border'
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">{message.sender_name}</span>
                        <span className={`text-xs ${
                          message.sender_type === 'admin' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
                              {attachment.type === 'image' ? (
                                <Image className="h-4 w-4" />
                              ) : (
                                <File className="h-4 w-4" />
                              )}
                              <span className="text-xs truncate">{attachment.name}</span>
                              <span className="text-xs text-gray-500">
                                {formatFileSize(attachment.size)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {message.sender_type === 'sub_contractor' && (
                    <Avatar className="h-8 w-8 order-2 ml-2">
                      <AvatarImage src={currentThread.participants[1]?.avatar} />
                      <AvatarFallback>
                        {currentThread.participants[1]?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg px-4 py-2 border">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <span className="text-sm text-gray-500 ml-2">Typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              {selectedFiles.length > 0 && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded border">
                        <File className="h-4 w-4" />
                        <span className="text-sm truncate max-w-32">{file.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="min-h-[40px]"
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAttachments(!showAttachments)}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() && selectedFiles.length === 0}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 