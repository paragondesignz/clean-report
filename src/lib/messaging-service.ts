import { supabase } from './supabase-client'

export interface Message {
  id: string
  thread_id: string
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

export interface MessageAttachment {
  id: string
  name: string
  type: 'image' | 'file'
  url: string
  size: number
}

export interface ChatThread {
  id: string
  admin_id: string
  sub_contractor_id: string
  job_id?: string
  last_message?: Message
  unread_count: number
  created_at: string
  updated_at: string
}

export interface ChatParticipant {
  id: string
  name: string
  type: 'admin' | 'sub_contractor'
  avatar?: string
  is_online: boolean
  last_seen: string
}

export class MessagingService {
  // Get all chat threads for a user
  static async getChatThreads(userId: string, userType: 'admin' | 'sub_contractor'): Promise<ChatThread[]> {
    try {
      let query = supabase
        .from('chat_threads')
        .select(`
          *,
          messages:messages(*)
        `)

      if (userType === 'admin') {
        query = query.eq('admin_id', userId)
      } else {
        query = query.eq('sub_contractor_id', userId)
      }

      const { data, error } = await query.order('updated_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching chat threads:', error)
      throw error
    }
  }

  // Get messages for a specific thread
  static async getMessages(threadId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('timestamp', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching messages:', error)
      throw error
    }
  }

  // Send a new message
  static async sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    try {
      const newMessage = {
        ...message,
        timestamp: new Date().toISOString(),
        is_read: false
      }

      const { data, error } = await supabase
        .from('messages')
        .insert([newMessage])
        .select()
        .single()

      if (error) throw error

      // Update thread's last message and unread count
      await this.updateThreadLastMessage(message.thread_id, data)

      return data
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(threadId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('thread_id', threadId)
        .neq('sender_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking messages as read:', error)
      throw error
    }
  }

  // Create a new chat thread
  static async createThread(adminId: string, subContractorId: string, jobId?: string): Promise<ChatThread> {
    try {
      const { data, error } = await supabase
        .from('chat_threads')
        .insert([{
          admin_id: adminId,
          sub_contractor_id: subContractorId,
          job_id: jobId,
          unread_count: 0
        }])
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error creating chat thread:', error)
      throw error
    }
  }

  // Get thread participants
  static async getThreadParticipants(threadId: string): Promise<ChatParticipant[]> {
    try {
      const { data: thread, error: threadError } = await supabase
        .from('chat_threads')
        .select('admin_id, sub_contractor_id')
        .eq('id', threadId)
        .single()

      if (threadError) throw threadError

      // Get admin details
      const { data: admin, error: adminError } = await supabase
        .from('user_profiles')
        .select('user_id, company_name')
        .eq('user_id', thread.admin_id)
        .single()

      if (adminError) throw adminError

      // Get sub contractor details
      const { data: subContractor, error: subError } = await supabase
        .from('sub_contractors')
        .select('user_id, first_name, last_name')
        .eq('user_id', thread.sub_contractor_id)
        .single()

      if (subError) throw subError

      return [
        {
          id: admin.user_id,
          name: admin.company_name,
          type: 'admin' as const,
          is_online: true, // In real app, check online status
          last_seen: new Date().toISOString()
        },
        {
          id: subContractor.user_id,
          name: `${subContractor.first_name} ${subContractor.last_name}`,
          type: 'sub_contractor' as const,
          is_online: false, // In real app, check online status
          last_seen: new Date().toISOString()
        }
      ]
    } catch (error) {
      console.error('Error fetching thread participants:', error)
      throw error
    }
  }

  // Upload file attachment
  static async uploadAttachment(file: File, threadId: string): Promise<MessageAttachment> {
    try {
      const fileName = `${threadId}/${Date.now()}-${file.name}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName)

      return {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: urlData.publicUrl,
        size: file.size
      }
    } catch (error) {
      console.error('Error uploading attachment:', error)
      throw error
    }
  }

  // Update thread's last message
  private static async updateThreadLastMessage(threadId: string, message: Message): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_threads')
        .update({
          last_message: message,
          updated_at: new Date().toISOString(),
          unread_count: supabase.sql`unread_count + 1`
        })
        .eq('id', threadId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating thread last message:', error)
      throw error
    }
  }

  // Search messages
  static async searchMessages(query: string, threadId?: string): Promise<Message[]> {
    try {
      let supabaseQuery = supabase
        .from('messages')
        .select('*')
        .textSearch('content', query)

      if (threadId) {
        supabaseQuery = supabaseQuery.eq('thread_id', threadId)
      }

      const { data, error } = await supabaseQuery.order('timestamp', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error searching messages:', error)
      throw error
    }
  }

  // Get unread message count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('chat_threads')
        .select('unread_count')
        .or(`admin_id.eq.${userId},sub_contractor_id.eq.${userId}`)

      if (error) throw error

      return data?.reduce((total, thread) => total + (thread.unread_count || 0), 0) || 0
    } catch (error) {
      console.error('Error getting unread count:', error)
      throw error
    }
  }

  // Delete message (admin only)
  static async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      // First check if user is admin
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('sender_id, thread_id')
        .eq('id', messageId)
        .single()

      if (fetchError) throw fetchError

      // Check if user is admin of this thread
      const { data: thread, error: threadError } = await supabase
        .from('chat_threads')
        .select('admin_id')
        .eq('id', message.thread_id)
        .single()

      if (threadError) throw threadError

      if (thread.admin_id !== userId) {
        throw new Error('Unauthorized: Only admins can delete messages')
      }

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting message:', error)
      throw error
    }
  }

  // Archive thread
  static async archiveThread(threadId: string, userId: string): Promise<void> {
    try {
      // Check if user is admin of this thread
      const { data: thread, error: threadError } = await supabase
        .from('chat_threads')
        .select('admin_id')
        .eq('id', threadId)
        .single()

      if (threadError) throw threadError

      if (thread.admin_id !== userId) {
        throw new Error('Unauthorized: Only admins can archive threads')
      }

      const { error } = await supabase
        .from('chat_threads')
        .update({ archived: true })
        .eq('id', threadId)

      if (error) throw error
    } catch (error) {
      console.error('Error archiving thread:', error)
      throw error
    }
  }
} 