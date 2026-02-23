'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  BookOpen,
  LogOut,
  Loader2,
  Filter,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Admin {
  id: string
  email: string
  username: string
  name: string
  avatar?: string
  role: string
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED'
  publishedAt?: string
  createdAt: string
  updatedAt: string
  views: number
  readTime?: number
  author: {
    id: string
    name: string
    username: string
    avatar?: string
  }
  category?: {
    id: string
    name: string
    slug: string
    color?: string
  }
  tags: string[]
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  _count?: {
    blogPosts: number
  }
}

export default function AdminCMSPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      // Check authentication
      const authResponse = await fetch('/api/auth/admin')
      if (!authResponse.ok) {
        router.push('/admin')
        return
      }

      const authData = await authResponse.json()
      setAdmin(authData.admin)

      // Load posts and categories
      await Promise.all([
        loadPosts(),
        loadCategories()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts?admin=true&limit=50')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories?count=true')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'logout' }),
      })
      router.push('/admin')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleDeletePost = async () => {
    if (!postToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/blog/posts/${postToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== postToDelete.id))
        setDeleteDialogOpen(false)
        setPostToDelete(null)
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    } finally {
      setDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'ARCHIVED':
        return 'bg-red-100 text-red-800'
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || post.category?.id === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading CMS...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-black rounded-full flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  AURA Blog CMS
                </h1>
                <p className="text-sm text-gray-500">Content Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{admin?.name}</p>
                  <p className="text-gray-500">{admin?.role}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="posts">Blog Posts</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="space-y-6">
              {/* Posts Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
                  <p className="text-gray-600">Manage your blog content</p>
                </div>
                <Button 
                  onClick={() => router.push('/admin/cms/new')}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Post</span>
                </Button>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search posts..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Posts List */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Posts ({filteredPosts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No posts found</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => router.push('/admin/cms/new')}
                      >
                        Create your first post
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredPosts.map((post) => (
                        <div 
                          key={post.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{post.title}</h3>
                              <Badge className={getStatusColor(post.status)}>
                                {post.status}
                              </Badge>
                              {post.category && (
                                <Badge 
                                  variant="outline"
                                  style={{ 
                                    backgroundColor: post.category.color + '20',
                                    borderColor: post.category.color,
                                    color: post.category.color 
                                  }}
                                >
                                  {post.category.name}
                                </Badge>
                              )}
                            </div>
                            {post.excerpt && (
                              <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>By {post.author.name}</span>
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              <span>{post.views} views</span>
                              {post.readTime && <span>{post.readTime} min read</span>}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/cms/edit/${post.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPostToDelete(post)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Manage blog categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Category management coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>CMS configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Settings panel coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{postToDelete?.title}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 