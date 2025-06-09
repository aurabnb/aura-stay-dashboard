'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Settings, 
  Wallet, 
  TrendingUp, 
  AlertTriangle, 
  Vote,
  TestTube
} from 'lucide-react'
import { useNotifications, type NotificationPreferences } from '@/components/notifications/NotificationSystem'
import { createNotificationDemo } from '@/hooks/useNotifications'

interface NotificationSettingsProps {
  onClose?: () => void
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { preferences, updatePreferences, clearAll, addNotification } = useNotifications()

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    updatePreferences({
      ...preferences,
      [key]: value
    })
  }

  const handleDemoNotifications = () => {
    createNotificationDemo(addNotification)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Customize your notification preferences and manage alerts
              </CardDescription>
            </div>
          </div>
          <Badge variant={preferences.enabled ? "default" : "secondary"}>
            {preferences.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-gray-600" />
            <div>
              <Label htmlFor="notifications-enabled" className="text-base font-medium">
                Enable Notifications
              </Label>
              <p className="text-sm text-gray-600">
                Turn all notifications on or off
              </p>
            </div>
          </div>
          <Switch
            id="notifications-enabled"
            checked={preferences.enabled}
            onCheckedChange={(checked) => handlePreferenceChange('enabled', checked)}
          />
        </div>

        {/* Sound Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center space-x-2">
            {preferences.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-blue-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400" />
            )}
            <span>Sound Settings</span>
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sound-enabled" className="text-base">
                Notification Sounds
              </Label>
              <p className="text-sm text-gray-600">
                Play audio alerts for notifications
              </p>
            </div>
            <Switch
              id="sound-enabled"
              checked={preferences.soundEnabled}
              onCheckedChange={(checked) => handlePreferenceChange('soundEnabled', checked)}
              disabled={!preferences.enabled}
            />
          </div>
        </div>

        {/* Notification Categories */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Categories</h3>
          
          <div className="space-y-4">
            {/* Wallet Events */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className="w-5 h-5 text-purple-600" />
                <div>
                  <Label htmlFor="wallet-events" className="text-base">
                    Wallet Events
                  </Label>
                  <p className="text-sm text-gray-600">
                    Connection, disconnection, and wallet changes
                  </p>
                </div>
              </div>
              <Switch
                id="wallet-events"
                checked={preferences.showOnWalletEvents}
                onCheckedChange={(checked) => handlePreferenceChange('showOnWalletEvents', checked)}
                disabled={!preferences.enabled}
              />
            </div>

            {/* Transaction Events */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <Label htmlFor="transaction-events" className="text-base">
                    Transaction Events
                  </Label>
                  <p className="text-sm text-gray-600">
                    Success, failure, and pending transactions
                  </p>
                </div>
              </div>
              <Switch
                id="transaction-events"
                checked={preferences.showOnTransactions}
                onCheckedChange={(checked) => handlePreferenceChange('showOnTransactions', checked)}
                disabled={!preferences.enabled}
              />
            </div>

            {/* Error Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <Label htmlFor="error-events" className="text-base">
                    Error Notifications
                  </Label>
                  <p className="text-sm text-gray-600">
                    Network errors, failed operations, and system issues
                  </p>
                </div>
              </div>
              <Switch
                id="error-events"
                checked={preferences.showOnErrors}
                onCheckedChange={(checked) => handlePreferenceChange('showOnErrors', checked)}
                disabled={!preferences.enabled}
              />
            </div>

            {/* Governance Events */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Vote className="w-5 h-5 text-blue-600" />
                <div>
                  <Label htmlFor="governance-events" className="text-base">
                    Governance Events
                  </Label>
                  <p className="text-sm text-gray-600">
                    New proposals, voting reminders, and results
                  </p>
                </div>
              </div>
              <Switch
                id="governance-events"
                checked={preferences.showOnGovernance}
                onCheckedChange={(checked) => handlePreferenceChange('showOnGovernance', checked)}
                disabled={!preferences.enabled}
              />
            </div>
          </div>
        </div>

        {/* Position Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Display Settings</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="position" className="text-base">
                Notification Position
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                Choose where notifications appear on screen
              </p>
              <Select
                value={preferences.position}
                onValueChange={(value: any) => handlePreferenceChange('position', value)}
                disabled={!preferences.enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="max-notifications" className="text-base">
                Maximum Notifications: {preferences.maxNotifications}
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                How many notifications to show at once
              </p>
              <Slider
                id="max-notifications"
                value={[preferences.maxNotifications]}
                onValueChange={(value) => handlePreferenceChange('maxNotifications', value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
                disabled={!preferences.enabled}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            onClick={handleDemoNotifications}
            variant="outline"
            className="flex items-center space-x-2"
            disabled={!preferences.enabled}
          >
            <TestTube className="w-4 h-4" />
            <span>Test Notifications</span>
          </Button>

          <Button
            onClick={clearAll}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Clear All</span>
          </Button>

          {onClose && (
            <Button onClick={onClose} className="sm:ml-auto">
              Done
            </Button>
          )}
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Notifications will automatically disappear after a few seconds</li>
            <li>• Important error messages may stay longer to ensure you see them</li>
            <li>• You can click notifications to dismiss them early</li>
            <li>• Some notifications include action buttons for quick access</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 