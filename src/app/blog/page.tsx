'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Calendar, 
  Clock, 
  Eye, 
  User, 
  ChevronRight,
  Filter,
  BookOpen,
  ArrowRight
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  featuredImage?: string
  publishedAt: string
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
  color?: string
  _count?: {
    blogPosts: number
  }
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadBlogData()
  }, [currentPage, selectedCategory, searchTerm])

  const loadBlogData = async () => {
    try {
      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
      })

      const [postsResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/blog/posts?${searchParams}`),
        fetch('/api/blog/categories?count=true')
      ])

      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        setPosts(postsData.posts)
        setTotalPages(postsData.pagination.pages)
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories)
      }
    } catch (error) {
      console.error('Error loading blog data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadBlogData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AURA Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Insights, updates, and stories from the decentralized hospitality revolution
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </form>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name} ({category._count?.blogPosts || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Categories */}
        {categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 4).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className="p-4 text-left border rounded-lg hover:shadow-md transition-shadow"
                  style={{
                    borderColor: category.color || '#e5e7eb',
                    backgroundColor: selectedCategory === category.slug 
                      ? (category.color + '20') 
                      : 'white'
                  }}
                >
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">
                    {category._count?.blogPosts || 0} articles
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Check back soon for new content!'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setCurrentPage(1)
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                    {post.featuredImage && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    <CardHeader className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
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
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(post.publishedAt)}
                        </div>
                      </div>
                      
                      <CardTitle className="line-clamp-2 group-hover:text-gray-600 transition-colors">
                        {post.title}
                      </CardTitle>
                      
                      {post.excerpt && (
                        <CardDescription className="line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {post.author.name}
                          </div>
                          {post.readTime && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {post.readTime} min read
                            </div>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {post.views}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="px-2">...</span>
                    }
                    return null
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stay Updated
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community to get the latest insights on decentralized hospitality 
            and the future of travel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="https://t.me/aurabnb" target="_blank">
              <Button className="flex items-center space-x-2">
                <span>Join Telegram</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center space-x-2">
                <span>Explore Dashboard</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 