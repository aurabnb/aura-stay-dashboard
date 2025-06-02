import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"

interface SocialMetrics {
  twitter: {
    followers: number
    isLoading: boolean
    error: string | null
  }
  telegram: {
    members: number
    isLoading: boolean
    error: string | null
  }
  linkedin: {
    followers: number
    isLoading: boolean
    error: string | null
  }
  lastUpdated: Date | null
}

export const useSocialMetrics = () => {
  const [metrics, setMetrics] = useState<SocialMetrics>({
    twitter: { followers: 0, isLoading: true, error: null },
    telegram: { members: 0, isLoading: true, error: null },
    linkedin: { followers: 0, isLoading: true, error: null },
    lastUpdated: null,
  })

  const fetchTwitterFollowers = async () => {
    try {
      setMetrics((prev) => ({
        ...prev,
        twitter: { ...prev.twitter, isLoading: true, error: null },
      }))

      // Using a proxy service to bypass CORS - RapidAPI Twitter API
      const response = await fetch("/api/twitter-followers")

      if (!response.ok) {
        throw new Error("Failed to fetch Twitter data")
      }

      const data = await response.json()

      setMetrics((prev) => ({
        ...prev,
        twitter: {
          followers: data.followers || 0,
          isLoading: false,
          error: null,
        },
      }))
    } catch (error) {
      console.error("Error fetching Twitter followers:", error)
      setMetrics((prev) => ({
        ...prev,
        twitter: {
          followers: 0,
          isLoading: false,
          error: "Unable to fetch",
        },
      }))
    }
  }

  const fetchTelegramMembers = async () => {
    try {
      setMetrics((prev) => ({
        ...prev,
        telegram: { ...prev.telegram, isLoading: true, error: null },
      }))

      // Telegram Bot API to get chat member count
      const response = await fetch("/api/telegram-members")

      if (!response.ok) {
        throw new Error("Failed to fetch Telegram data")
      }

      const data = await response.json()

      setMetrics((prev) => ({
        ...prev,
        telegram: {
          members: data.members || 0,
          isLoading: false,
          error: null,
        },
      }))
    } catch (error) {
      console.error("Error fetching Telegram members:", error)
      setMetrics((prev) => ({
        ...prev,
        telegram: {
          members: 0,
          isLoading: false,
          error: "Unable to fetch",
        },
      }))
    }
  }

  const fetchLinkedInFollowers = async () => {
    try {
      setMetrics((prev) => ({
        ...prev,
        linkedin: { ...prev.linkedin, isLoading: true, error: null },
      }))

      // LinkedIn API call
      const response = await fetch("/api/linkedin-followers")

      if (!response.ok) {
        throw new Error("Failed to fetch LinkedIn data")
      }

      const data = await response.json()

      setMetrics((prev) => ({
        ...prev,
        linkedin: {
          followers: data.followers || 0,
          isLoading: false,
          error: null,
        },
      }))
    } catch (error) {
      console.error("Error fetching LinkedIn followers:", error)
      setMetrics((prev) => ({
        ...prev,
        linkedin: {
          followers: 0,
          isLoading: false,
          error: "Unable to fetch",
        },
      }))
    }
  }

  const fetchAllMetrics = async () => {
    // Fetching social media metrics

    await Promise.all([
      fetchTwitterFollowers(),
      fetchTelegramMembers(),
      fetchLinkedInFollowers(),
    ])

    setMetrics((prev) => ({
      ...prev,
      lastUpdated: new Date(),
    }))

    toast({
      title: "Social Metrics Updated",
      description: "Successfully fetched latest follower counts",
    })
  }

  useEffect(() => {
    fetchAllMetrics()

    // Update every 10 minutes
    const interval = setInterval(fetchAllMetrics, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return {
    metrics,
    refreshMetrics: fetchAllMetrics,
    isLoading:
      metrics.twitter.isLoading ||
      metrics.telegram.isLoading ||
      metrics.linkedin.isLoading,
  }
}
