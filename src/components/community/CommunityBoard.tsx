'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, Users, ThumbsUp, ThumbsDown, Send, Loader2 } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useToast } from '@/hooks/use-toast'

interface CommunityMessage {
  id: string
  content: string
  authorId: string
  category: string
  upvotes: number
  downvotes: number
  timestamp: string
  author: {
    username?: string
    walletAddress?: string
  }
}

const categories = [
  { value: 'general', label: 'General Discussion', color: 'bg-blue-100 text-blue-800' },
  { value: 'proposals', label: 'Proposals', color: 'bg-green-100 text-green-800' },
  { value: 'feedback', label: 'Feedback', color: 'bg-orange-100 text-orange-800' },
  { value: 'technical', label: 'Technical', color: 'bg-purple-100 text-purple-800' },
  { value: 'treasury', label: 'Treasury', color: 'bg-yellow-100 text-yellow-800' }
]

export function CommunityBoard() {
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()
  const [messages, setMessages] = useState<CommunityMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    fetchMessages()
  }, [activeCategory])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const categoryQuery = activeCategory !== 'all' ? `?category=${activeCategory}` : ''
      const response = await fetch(`/api/community${categoryQuery}`)
      
      if (!response.ok) throw new Error('Failed to fetch messages')
      
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast({
        title: "Error",
        description: "Failed to load community messages",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!connected || !publicKey) {
      toast({
        title: "Error",
        description: "Please connect your wallet to post messages",
        variant: "destructive"
      })
      return
    }

    if (!newMessage.trim()) {
      toast({
        title: "Error",
        description: "Message content is required",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage,
          category: selectedCategory,
          walletAddress: publicKey.toString()
        })
      })

      if (!response.ok) throw new Error('Failed to submit message')

      const newMessageData = await response.json()
      setMessages(prev => [newMessageData, ...prev])
      setNewMessage('')
      toast({
        title: "Success",
        description: "Message submitted successfully!"
      })
    } catch (error) {
      console.error('Error submitting message:', error)
      toast({
        title: "Error",
        description: "Failed to submit message",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (messageId: string, action: 'upvote' | 'downvote') => {
    if (!connected || !publicKey) {
      toast({
        title: "Error", 
        description: "Please connect your wallet to vote",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/community', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageId,
          action,
          userId: publicKey.toString()
        })
      })

      if (!response.ok) throw new Error('Failed to vote')

      const updatedMessage = await response.json()
      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? updatedMessage : msg)
      )
      
      toast({
        title: "Success",
        description: `${action === 'upvote' ? 'Upvoted' : 'Downvoted'} successfully!`
      })
    } catch (error) {
      console.error('Error voting:', error)
      toast({
        title: "Error",
        description: "Failed to vote on message",
        variant: "destructive"
      })
    }
  }

  const getCategoryColor = (category: string) => {
    return categories.find(cat => cat.value === category)?.color || 'bg-gray-100 text-gray-800'
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Board</h1>
        <p className="text-muted-foreground">
          Engage with the Aura Foundation community, share ideas, and participate in discussions.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Submit Message Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Submit Message
              </CardTitle>
              <CardDescription>
                Share your thoughts with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!connected ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Connect Your Wallet
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect your wallet to participate in community discussions and submit suggestions.
                  </p>
                  <p className="text-xs text-gray-500">
                    Only verified wallet holders can post to maintain quality discussions.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitMessage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Message
                    </label>
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Share your thoughts, suggestions, or feedback..."
                      rows={4}
                      className="resize-none"
                      maxLength={500}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {newMessage.length}/500 characters
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={submitting || !newMessage.trim()}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Messages Feed Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Community Messages
              </CardTitle>
              <CardDescription>
                Recent discussions and community feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant={activeCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory('all')}
                >
                  All Messages
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    variant={activeCategory === category.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory(category.value)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>

              <Separator className="mb-6" />

              {/* Messages List */}
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    {activeCategory === 'all' 
                      ? 'No messages yet. Be the first to start a discussion!' 
                      : `No messages in ${categories.find(c => c.value === activeCategory)?.label || activeCategory} category yet.`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div key={message.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {message.author.username?.[0]?.toUpperCase() || 
                             message.author.walletAddress?.slice(0, 1).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {message.author.username || 
                               `${message.author.walletAddress?.slice(0, 4)}...${message.author.walletAddress?.slice(-4)}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTimestamp(message.timestamp)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getCategoryColor(message.category)}>
                          {categories.find(cat => cat.value === message.category)?.label || message.category}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-900 mb-3 leading-relaxed">
                        {message.content}
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleVote(message.id, 'upvote')}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                          disabled={!connected}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          {message.upvotes}
                        </button>
                        <button
                          onClick={() => handleVote(message.id, 'downvote')}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                          disabled={!connected}
                        >
                          <ThumbsDown className="h-4 w-4" />
                          {message.downvotes}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 