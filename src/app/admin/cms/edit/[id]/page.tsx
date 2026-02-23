'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  X, 
  Loader2,
  Plus,
  FileText,
  Trash2
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BlogCategory {
  id: string
  name: string
  slug: string
  color?: string
}

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED'
  categoryId?: string
  tags: string[]
  metaTitle?: string
  metaDescription?: string
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
}

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [post, setPost] = useState<BlogPost | null>(null)
  
  // Form data
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED'>('DRAFT')

  useEffect(() => {
    if (params.id) {
      checkAuthAndLoadData()
    }
  }, [params.id])

  const checkAuthAndLoadData = async () => {
    try {
      // Check authentication
      const authResponse = await fetch('/api/auth/admin')
      if (!authResponse.ok) {
        router.push('/admin')
        return
      }

      // Load post data and categories
      const [postResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/blog/posts/${params.id}?admin=true`),
        fetch('/api/blog/categories')
      ])

      if (postResponse.ok) {
        const postData = await postResponse.json()
        const postInfo = postData.post
        setPost(postInfo)
        
        // Populate form fields
        setTitle(postInfo.title)
        setContent(postInfo.content)
        setExcerpt(postInfo.excerpt || '')
        setFeaturedImage(postInfo.featuredImage || '')
        setCategoryId(postInfo.categoryId || '')
        setTags(postInfo.tags || [])
        setMetaTitle(postInfo.metaTitle || '')
        setMetaDescription(postInfo.metaDescription || '')
        setStatus(postInfo.status)
      } else {
        setError('Post not found')
        return
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load post data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async (publishStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED') => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/blog/posts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || undefined,
          featuredImage: featuredImage.trim() || undefined,
          categoryId: categoryId || undefined,
          tags,
          metaTitle: metaTitle.trim() || undefined,
          metaDescription: metaDescription.trim() || undefined,
          status: publishStatus,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push('/admin/cms')
      } else {
        setError(data.error || 'Failed to update post')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      setError('An error occurred while updating the post')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/blog/posts/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/cms')
      } else {
        setError('Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      setError('An error occurred while deleting the post')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    if (post) {
      window.open(`/blog/${post.slug}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading post...</span>
        </div>
      </div>
    )
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/admin/cms')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CMS
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/admin/cms')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to CMS</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Edit Post
                </h1>
                <p className="text-sm text-gray-500">Update your blog post</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!post}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave('DRAFT')}
                disabled={saving || !title || !content}
                className="flex items-center space-x-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Save Draft</span>
              </Button>
              <Button
                onClick={() => handleSave(status)}
                disabled={saving || !title || !content}
                className="flex items-center space-x-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span>Update</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <Card>
              <CardHeader>
                <CardTitle>Post Title</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Enter post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg"
                />
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
                <CardDescription>
                  Add a featured image URL for your post
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                  />
                  {featuredImage && (
                    <div className="relative">
                      <img
                        src={featuredImage}
                        alt="Featured"
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Write your blog post content here... (supports Markdown)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] font-mono"
                />
                <div className="mt-2 text-xs text-gray-500">
                  You can use Markdown formatting (##, **, *, etc.)
                </div>
              </CardContent>
            </Card>

            {/* Excerpt */}
            <Card>
              <CardHeader>
                <CardTitle>Excerpt</CardTitle>
                <CardDescription>
                  A brief summary of your post (optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Write a brief excerpt..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="h-24"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Publish Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(value: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED') => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={categoryId || "none"} onValueChange={(value) => setCategoryId(value === "none" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
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

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddTag}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Optimize your post for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Meta Title</Label>
                  <Input
                    placeholder="SEO title (optional)"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    placeholder="SEO description (optional)"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="h-20"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 