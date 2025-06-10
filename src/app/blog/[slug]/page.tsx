'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  Eye, 
  User, 
  ArrowLeft,
  Share2,
  BookOpen,
  ChevronRight,
  Twitter,
  Linkedin,
  Link as LinkIcon
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: string
  publishedAt: string
  views: number
  readTime?: number
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
  tags: string[]
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.slug) {
      loadPost(params.slug as string)
    }
  }, [params.slug])

  const loadPost = async (slug: string) => {
    try {
      const response = await fetch(`/api/blog/posts/${slug}`)
      
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
        setRelatedPosts(data.relatedPosts || [])
      } else if (response.status === 404) {
        setError('Blog post not found')
      } else {
        setError('Failed to load blog post')
      }
    } catch (error) {
      console.error('Error loading blog post:', error)
      setError('An error occurred while loading the post')
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

  const handleShare = async (platform?: string) => {
    const url = window.location.href
    const title = post?.title || 'AURA Blog Post'
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank')
    } else if (platform === 'linkedin') {
      window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
    } else {
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        toast({
          title: 'Link copied!',
          description: 'The blog post link has been copied to your clipboard.',
        })
      } catch (error) {
        console.error('Failed to copy link:', error)
        toast({
          title: 'Copy failed',
          description: 'Unable to copy link to clipboard.',
          variant: 'destructive',
        })
      }
    }
  }

  // Convert markdown to HTML (simple implementation)
  const renderContent = (content: string) => {
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4 text-gray-900">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3 text-gray-900">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-4 mb-2 text-gray-900">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">')
      .replace(/^(?!<[h|l])/gm, '<p class="mb-4 text-gray-700 leading-relaxed">')
      .replace(/(?<!\>)$/gm, '</p>')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error === 'Blog post not found' ? 'Post Not Found' : 'Error Loading Post'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error === 'Blog post not found' 
                ? 'The blog post you\'re looking for doesn\'t exist or has been removed.'
                : 'We encountered an error while loading this blog post.'
              }
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Link href="/blog">
                <Button>
                  View All Posts
                </Button>
              </Link>
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
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/blog" className="hover:text-gray-700">Blog</Link>
          <ChevronRight className="h-4 w-4" />
          {post.category && (
            <>
              <span className="hover:text-gray-700">{post.category.name}</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
          <span className="text-gray-900 truncate">{post.title}</span>
        </nav>

        {/* Post Header */}
        <div className="mb-8">
          {post.category && (
            <Badge 
              className="mb-4"
              style={{ 
                backgroundColor: post.category.color + '20',
                borderColor: post.category.color,
                color: post.category.color 
              }}
            >
              {post.category.name}
            </Badge>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>
          
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>By {post.author.name}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            {post.readTime && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{post.readTime} min read</span>
              </div>
            )}
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              <span>{post.views} views</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-2 mt-6">
            <span className="text-sm text-gray-500 mr-2">Share:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('twitter')}
              className="flex items-center space-x-1"
            >
              <Twitter className="h-4 w-4" />
              <span>Twitter</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('linkedin')}
              className="flex items-center space-x-1"
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare()}
              className="flex items-center space-x-1"
            >
              <LinkIcon className="h-4 w-4" />
              <span>Copy Link</span>
            </Button>
          </div>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Post Content */}
        <article className="prose prose-lg max-w-none">
          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
          />
        </article>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{post.author.name}</h3>
              <p className="text-gray-600">Founder & CEO, AURA</p>
              <p className="text-sm text-gray-500 mt-2">
                Matt Haynes is the founder of AURA, leading the charge in revolutionizing hospitality through blockchain technology and community ownership. With a vision for decentralized travel experiences, he's building the future where travelers become stakeholders in the properties they visit.
              </p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group block"
                >
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                    {relatedPost.featuredImage && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    <CardHeader>
                      {relatedPost.category && (
                        <Badge 
                          className="mb-2 w-fit"
                          style={{ 
                            backgroundColor: relatedPost.category.color + '20',
                            borderColor: relatedPost.category.color,
                            color: relatedPost.category.color 
                          }}
                        >
                          {relatedPost.category.name}
                        </Badge>
                      )}
                      
                      <CardTitle className="line-clamp-2 group-hover:text-gray-600 transition-colors">
                        {relatedPost.title}
                      </CardTitle>
                      
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(relatedPost.publishedAt)}
                        {relatedPost.readTime && (
                          <>
                            <span className="mx-2">•</span>
                            <Clock className="h-3 w-3 mr-1" />
                            {relatedPost.readTime} min
                          </>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Link href="/blog">
              <Button variant="outline">
                All Posts
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 