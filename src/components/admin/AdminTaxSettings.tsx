'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  Save, 
  RefreshCw, 
  TrendingUp, 
  Wallet, 
  Shield,
  AlertTriangle,
  CheckCircle 
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TaxSettings {
  swapTaxRate: number
  buyTaxRate: number
  sellTaxRate: number
  stakeTaxRate: number
  unstakeTaxRate: number
  rewardTaxRate: number
  minimumTaxAmount: number
  maximumTaxAmount: number
  taxWalletAddress: string
  autoDistribution: boolean
  enabledForPairs: string[]
  exemptWallets: string[]
}

export const AdminTaxSettings: React.FC = () => {
  const { toast } = useToast()
  const [settings, setSettings] = useState<TaxSettings>({
    swapTaxRate: 2.0,
    buyTaxRate: 1.5,
    sellTaxRate: 2.5,
    stakeTaxRate: 1.0,
    unstakeTaxRate: 2.0,
    rewardTaxRate: 1.5,
    minimumTaxAmount: 0.001,
    maximumTaxAmount: 10.0,
    taxWalletAddress: 'fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh',
    autoDistribution: true,
    enabledForPairs: ['SOL/AURA', 'USDC/AURA'],
    exemptWallets: []
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [newExemptWallet, setNewExemptWallet] = useState('')

  useEffect(() => {
    // Load settings from API
    loadTaxSettings()
  }, [])

  const loadTaxSettings = async () => {
    try {
      const response = await fetch('/api/admin/tax-settings')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSettings(data.data)
        }
      } else {
        // Fallback to localStorage for development
        const savedSettings = localStorage.getItem('aura_tax_settings')
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
        }
      }
    } catch (error) {
      console.error('Failed to load tax settings:', error)
      // Fallback to localStorage
      const savedSettings = localStorage.getItem('aura_tax_settings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    }
  }

  const saveTaxSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/tax-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Also save to localStorage as backup
        localStorage.setItem('aura_tax_settings', JSON.stringify(settings))
        
        toast({
          title: "Settings Saved",
          description: "Tax settings have been updated successfully.",
        })
        
        setHasChanges(false)
      } else {
        throw new Error(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save tax settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = (key: keyof TaxSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    setHasChanges(true)
  }

  const addExemptWallet = () => {
    if (newExemptWallet.trim()) {
      updateSetting('exemptWallets', [...settings.exemptWallets, newExemptWallet.trim()])
      setNewExemptWallet('')
    }
  }

  const removeExemptWallet = (address: string) => {
    updateSetting('exemptWallets', settings.exemptWallets.filter(addr => addr !== address))
  }

  const resetToDefaults = async () => {
    try {
      const response = await fetch('/api/admin/tax-settings', {
        method: 'PUT'
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSettings(data.data)
        setHasChanges(false)
        
        toast({
          title: "Settings Reset",
          description: "Tax settings have been reset to defaults.",
        })
      } else {
        throw new Error(data.error || 'Failed to reset settings')
      }
    } catch (error) {
      console.error('Reset error:', error)
      // Fallback to manual reset
      setSettings({
        swapTaxRate: 2.0,
        buyTaxRate: 1.5,
        sellTaxRate: 2.5,
        stakeTaxRate: 1.0,
        unstakeTaxRate: 2.0,
        rewardTaxRate: 1.5,
        minimumTaxAmount: 0.001,
        maximumTaxAmount: 10.0,
        taxWalletAddress: 'fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh',
        autoDistribution: true,
        enabledForPairs: ['SOL/AURA', 'USDC/AURA'],
        exemptWallets: []
      })
      setHasChanges(true)
      
      toast({
        title: "Settings Reset",
        description: "Tax settings have been reset to defaults (offline mode).",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {hasChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don't forget to save your tax settings.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tax Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tax Rate Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Swap Tax Rate */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Swap Tax Rate</Label>
              <Badge variant="secondary">{settings.swapTaxRate}%</Badge>
            </div>
            <Slider
              value={[settings.swapTaxRate]}
              onValueChange={(value) => updateSetting('swapTaxRate', value[0])}
              max={10}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-sm text-gray-600">
              Applied to all swap transactions on Jupiter DEX
            </p>
          </div>

          {/* Buy Tax Rate */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Buy Tax Rate</Label>
              <Badge variant="secondary">{settings.buyTaxRate}%</Badge>
            </div>
            <Slider
              value={[settings.buyTaxRate]}
              onValueChange={(value) => updateSetting('buyTaxRate', value[0])}
              max={5}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Sell Tax Rate */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Sell Tax Rate</Label>
              <Badge variant="secondary">{settings.sellTaxRate}%</Badge>
            </div>
            <Slider
              value={[settings.sellTaxRate]}
              onValueChange={(value) => updateSetting('sellTaxRate', value[0])}
              max={5}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Staking Tax Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Staking Tax Configuration
          </CardTitle>
          <p className="text-sm text-gray-600">
            All staking taxes are redistributed as additional rewards to stakers
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stake Tax Rate */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Stake Tax Rate</Label>
              <Badge variant="secondary">{settings.stakeTaxRate}%</Badge>
            </div>
            <Slider
              value={[settings.stakeTaxRate]}
              onValueChange={(value) => updateSetting('stakeTaxRate', value[0])}
              max={10}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-sm text-gray-600">
              Applied when users stake AURA tokens. Tax redistributed as rewards.
            </p>
          </div>

          {/* Unstake Tax Rate */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Unstake Tax Rate</Label>
              <Badge variant="secondary">{settings.unstakeTaxRate}%</Badge>
            </div>
            <Slider
              value={[settings.unstakeTaxRate]}
              onValueChange={(value) => updateSetting('unstakeTaxRate', value[0])}
              max={10}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-sm text-gray-600">
              Applied when users unstake AURA tokens. Tax redistributed as rewards.
            </p>
          </div>

          {/* Reward Tax Rate */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Reward Claim Tax Rate</Label>
              <Badge variant="secondary">{settings.rewardTaxRate}%</Badge>
            </div>
            <Slider
              value={[settings.rewardTaxRate]}
              onValueChange={(value) => updateSetting('rewardTaxRate', value[0])}
              max={10}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-sm text-gray-600">
              Applied when users claim staking rewards. Tax redistributed as rewards.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tax Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tax Limits & Constraints
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minTax">Minimum Tax Amount (SOL)</Label>
              <Input
                id="minTax"
                type="number"
                step="0.001"
                value={settings.minimumTaxAmount}
                onChange={(e) => updateSetting('minimumTaxAmount', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="maxTax">Maximum Tax Amount (SOL)</Label>
              <Input
                id="maxTax"
                type="number"
                step="0.1"
                value={settings.maximumTaxAmount}
                onChange={(e) => updateSetting('maximumTaxAmount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Collection Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Tax Collection Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="taxWallet">Tax Collection Wallet</Label>
            <Input
              id="taxWallet"
              value={settings.taxWalletAddress}
              onChange={(e) => updateSetting('taxWalletAddress', e.target.value)}
              placeholder="Enter Solana wallet address"
            />
            <p className="text-sm text-gray-600 mt-1">
              All collected taxes will be sent to this wallet
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Auto Distribution</Label>
              <p className="text-sm text-gray-600">
                Automatically distribute taxes to treasury wallets
              </p>
            </div>
            <Switch
              checked={settings.autoDistribution}
              onCheckedChange={(checked) => updateSetting('autoDistribution', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Exempt Wallets */}
      <Card>
        <CardHeader>
          <CardTitle>Tax-Exempt Wallets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add wallet address to exempt from taxes"
              value={newExemptWallet}
              onChange={(e) => setNewExemptWallet(e.target.value)}
            />
            <Button onClick={addExemptWallet} disabled={!newExemptWallet.trim()}>
              Add
            </Button>
          </div>

          {settings.exemptWallets.length > 0 && (
            <div className="space-y-2">
              {settings.exemptWallets.map((address, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <code className="text-sm">{address}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeExemptWallet(address)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={resetToDefaults}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset to Defaults
        </Button>

        <Button
          onClick={saveTaxSettings}
          disabled={!hasChanges || isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
} 