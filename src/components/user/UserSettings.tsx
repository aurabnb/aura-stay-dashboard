'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Shield, 
  Bell, 
  Eye, 
  EyeOff,
  Moon,
  Sun,
  Globe,
  Save,
  Download,
  Trash2,
  AlertTriangle,
  Key,
  Smartphone,
  Mail,
  Palette,
  Database,
  HelpCircle
} from 'lucide-react'
import { useLocalStorage } from '@/hooks/enhanced-hooks'
import { analytics } from '@/lib/analytics'

interface UserSettingsProps {}

export function UserSettings({}: UserSettingsProps) {
  // Settings state
  const [theme, setTheme] = useLocalStorage('theme', 'system')
  const [language, setLanguage] = useLocalStorage('language', 'en')
  const [currency, setCurrency] = useLocalStorage('currency', 'USD')
  const [notifications, setNotifications] = useLocalStorage('notifications', {
    email: true,
    push: true,
    trading: true,
    staking: true,
    governance: true,
    marketing: false
  })
  const [privacy, setPrivacy] = useLocalStorage('privacy', {
    showPortfolio: true,
    showActivity: true,
    allowAnalytics: true
  })
  const [security, setSecurity] = useLocalStorage('security', {
    twoFactorEnabled: false,
    autoLockEnabled: true,
    autoLockTime: 30
  })

  const [isExporting, setIsExporting] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const handleSaveSettings = () => {
    analytics.track('settings_saved', { timestamp: Date.now() })
    // Settings are auto-saved via useLocalStorage
  }

  const handleExportData = async () => {
    setIsExporting(true)
    analytics.track('data_export_requested', { timestamp: Date.now() })
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      // In real implementation, trigger download
    }, 2000)
  }

  const handleDeleteAccount = () => {
    setIsDeletingAccount(true)
    analytics.track('account_deletion_initiated', { timestamp: Date.now() })
    // In real implementation, show confirmation modal
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-6 h-6" />
            <span>Settings</span>
          </CardTitle>
          <CardDescription>
            Manage your account preferences, security settings, and privacy options
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center space-x-2">
                        <Sun className="w-4 h-4" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center space-x-2">
                        <Moon className="w-4 h-4" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="BTC">BTC (₿)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Regional Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Timezone</Label>
                <Select defaultValue="UTC">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">EST</SelectItem>
                    <SelectItem value="PST">PST</SelectItem>
                    <SelectItem value="GMT">GMT</SelectItem>
                    <SelectItem value="JST">JST</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Date Format</Label>
                <Select defaultValue="MM/DD/YYYY">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-600">Receive browser push notifications</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.push}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, push: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Notification Categories</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="trading-notifications">Trading & Swaps</Label>
                      <p className="text-sm text-gray-600">Transaction confirmations and price alerts</p>
                    </div>
                    <Switch
                      id="trading-notifications"
                      checked={notifications.trading}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, trading: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="staking-notifications">Staking & Rewards</Label>
                      <p className="text-sm text-gray-600">Staking confirmations and reward distributions</p>
                    </div>
                    <Switch
                      id="staking-notifications"
                      checked={notifications.staking}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, staking: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="governance-notifications">Governance</Label>
                      <p className="text-sm text-gray-600">New proposals and voting reminders</p>
                    </div>
                    <Switch
                      id="governance-notifications"
                      checked={notifications.governance}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, governance: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="marketing-notifications">Marketing & Updates</Label>
                      <p className="text-sm text-gray-600">Product updates and promotional content</p>
                    </div>
                    <Switch
                      id="marketing-notifications"
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, marketing: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Privacy Settings</span>
              </CardTitle>
              <CardDescription>
                Control what information is visible to others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-portfolio">Show Portfolio</Label>
                  <p className="text-sm text-gray-600">Make your portfolio visible to other users</p>
                </div>
                <Switch
                  id="show-portfolio"
                  checked={privacy.showPortfolio}
                  onCheckedChange={(checked) => 
                    setPrivacy(prev => ({ ...prev, showPortfolio: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-activity">Show Activity</Label>
                  <p className="text-sm text-gray-600">Make your recent activity visible</p>
                </div>
                <Switch
                  id="show-activity"
                  checked={privacy.showActivity}
                  onCheckedChange={(checked) => 
                    setPrivacy(prev => ({ ...prev, showActivity: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow-analytics">Analytics & Tracking</Label>
                  <p className="text-sm text-gray-600">Help improve the platform with usage analytics</p>
                </div>
                <Switch
                  id="allow-analytics"
                  checked={privacy.allowAnalytics}
                  onCheckedChange={(checked) => 
                    setPrivacy(prev => ({ ...prev, allowAnalytics: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>
                Protect your account with advanced security features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {security.twoFactorEnabled && (
                      <Badge className="bg-green-500">Enabled</Badge>
                    )}
                    <Button variant="outline" size="sm">
                      {security.twoFactorEnabled ? 'Manage' : 'Enable'}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auto-lock">Auto-Lock</Label>
                    <p className="text-sm text-gray-600">Automatically lock your session after inactivity</p>
                  </div>
                  <Switch
                    id="auto-lock"
                    checked={security.autoLockEnabled}
                    onCheckedChange={(checked) => 
                      setSecurity(prev => ({ ...prev, autoLockEnabled: checked }))
                    }
                  />
                </div>

                {security.autoLockEnabled && (
                  <div className="space-y-3 ml-6">
                    <Label htmlFor="auto-lock-time">Auto-lock time (minutes)</Label>
                    <Select 
                      value={security.autoLockTime.toString()} 
                      onValueChange={(value) => 
                        setSecurity(prev => ({ ...prev, autoLockTime: parseInt(value) }))
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 min</SelectItem>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Key className="w-4 h-4" />
                    <span>Connected Wallets</span>
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">P</span>
                        </div>
                        <div>
                          <p className="font-medium">Phantom Wallet</p>
                          <p className="text-sm text-gray-600">7D9W...k3Qm</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500">Connected</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Data Management</span>
              </CardTitle>
              <CardDescription>
                Export your data or delete your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Export Your Data</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Download a copy of all your data including transactions, settings, and activity history.
                  </p>
                  <Button 
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
                  </Button>
                </div>

                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-medium mb-2 text-red-800 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Delete Account</span>
                  </h4>
                  <p className="text-sm text-red-700 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5" />
                <span>Need Help?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  Contact Support
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  View Documentation
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Join Community
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </Button>
      </div>
    </div>
  )
} 