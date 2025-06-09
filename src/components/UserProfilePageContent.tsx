'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Settings, 
  Wallet, 
  Edit3, 
  Save, 
  X,
  Mail,
  MapPin,
  Calendar,
  Globe,
  Twitter,
  Github,
  Linkedin,
  Copy,
  Check
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWallet } from '@solana/wallet-adapter-react'

interface UserProfile {
  id: string
  username: string
  email: string
  fullName: string
  bio: string
  avatar: string
  location: string
  website: string
  twitter: string
  github: string
  linkedin: string
  joinDate: string
  lastActive: string
  isVerified: boolean
  stats: {
    totalInvestments: number
    totalStaked: number
    governanceVotes: number
    propertiesOwned: number
  }
}

// Mock user data
const mockUserProfile: UserProfile = {
  id: 'user-123',
  username: 'aura_investor',
  email: 'investor@example.com',
  fullName: 'Alex Johnson',
  bio: 'Real estate enthusiast and DeFi investor. Passionate about tokenized properties and sustainable investments.',
  avatar: '/api/placeholder/150/150',
  location: 'San Francisco, CA',
  website: 'https://alexjohnson.dev',
  twitter: '@alexjohnson',
  github: 'alexjohnson',
  linkedin: 'alexjohnson',
  joinDate: '2023-06-15',
  lastActive: '2024-01-20',
  isVerified: true,
  stats: {
    totalInvestments: 125000,
    totalStaked: 50000,
    governanceVotes: 23,
    propertiesOwned: 5
  }
}

export default function UserProfilePageContent() {
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile>(mockUserProfile)
  const [activeTab, setActiveTab] = useState('profile')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const { connected, publicKey } = useWallet()

  const handleEdit = () => {
    setIsEditing(true)
    setEditedProfile({ ...profile })
  }

  const handleSave = () => {
    setProfile(editedProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile({ ...profile })
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile.avatar} alt={profile.fullName} />
                    <AvatarFallback className="text-xl">
                      {profile.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
                    {profile.isVerified && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600">@{profile.username}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Member since {formatDate(profile.joinDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                {!isEditing ? (
                  <Button onClick={handleEdit} className="flex items-center space-x-2">
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button onClick={handleSave} className="flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="flex items-center space-x-2">
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Investments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(profile.stats.totalInvestments)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Staked</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(profile.stats.totalStaked)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Governance Votes</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.stats.governanceVotes}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Properties Owned</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.stats.propertiesOwned}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Manage your personal details and public profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={isEditing ? editedProfile.fullName : profile.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={isEditing ? editedProfile.username : profile.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={isEditing ? editedProfile.email : profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={isEditing ? editedProfile.location : profile.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={isEditing ? editedProfile.bio : profile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Social Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={isEditing ? editedProfile.website : profile.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          id="twitter"
                          value={isEditing ? editedProfile.twitter : profile.twitter}
                          onChange={(e) => handleInputChange('twitter', e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={isEditing ? editedProfile.linkedin : profile.linkedin}
                          onChange={(e) => handleInputChange('linkedin', e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wallet Tab */}
            <TabsContent value="wallet" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Addresses</CardTitle>
                  <CardDescription>
                    Your connected wallet addresses for different blockchains
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Wallet className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Solana</p>
                        <p className="text-sm text-gray-600 font-mono">
                          {connected && publicKey ? publicKey.toString() : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {connected && publicKey && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(publicKey.toString(), 'Solana address')}
                        >
                          {copiedField === 'Solana address' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      <Badge variant={connected ? 'default' : 'secondary'}>
                        {connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
} 