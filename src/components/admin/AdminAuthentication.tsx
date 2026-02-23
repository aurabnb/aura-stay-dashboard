'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Eye, EyeOff, Lock } from 'lucide-react'

interface AdminAuthenticationProps {
  onAuthSuccess: () => void
}

export const AdminAuthentication: React.FC<AdminAuthenticationProps> = ({ onAuthSuccess }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Demo admin credentials - in production, this should be handled securely
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'aura2024!'
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (
      credentials.username === ADMIN_CREDENTIALS.username &&
      credentials.password === ADMIN_CREDENTIALS.password
    ) {
      // Store admin session (in production, use proper JWT/session management)
      localStorage.setItem('aura_admin_session', 'authenticated')
      onAuthSuccess()
    } else {
      setError('Invalid credentials. Please try again.')
    }

    setIsLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
        <p className="text-gray-600">
          Enter your credentials to access the admin dashboard
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter admin username"
              value={credentials.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter admin password"
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={isLoading}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !credentials.username || !credentials.password}
          >
            {isLoading ? (
              <>
                <Lock className="h-4 w-4 mr-2 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Access Admin Dashboard
              </>
            )}
          </Button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <strong>Demo Credentials:</strong>
          </p>
          <p className="text-sm text-gray-500 text-center mt-1">
            Username: <code className="bg-white px-1 rounded">admin</code><br />
            Password: <code className="bg-white px-1 rounded">aura2024!</code>
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 