"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Settings,
  Database,
  Bell,
  Palette,
  Shield,
  Quote,
  Target,
  CreditCard,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Save,
  RotateCcw,
  Globe,
} from "lucide-react"
import type { Transaction, Goal } from "@/app/page"
import type { CustomQuote } from "./custom-quotes-manager"

// Cookie utility functions
const setCookie = (name: string, value: string, days = 365) => {
  if (typeof window === "undefined") return
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null
  const nameEQ = name + "="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length))
  }
  return null
}

const deleteCookie = (name: string) => {
  if (typeof window === "undefined") return
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

export interface AppConfig {
  // General Settings
  currency: string
  dateFormat: string
  numberFormat: {
    decimalPlaces: number
    thousandsSeparator: string
  }
  defaultTransactionType: "income" | "expense"
  language: string

  // Display Preferences
  theme: "light" | "dark" | "system"
  chartAnimations: boolean
  defaultChartPeriod: string
  dashboardLayout: "compact" | "detailed"
  showQuickStats: boolean

  // Notifications
  notifications: {
    enabled: boolean
    overspendingAlerts: boolean
    goalDeadlineReminders: boolean
    weeklyReports: boolean
    goalAchievements: boolean
    reminderDays: number
  }

  // Quote Settings
  quotes: {
    enableCustomQuotes: boolean
    customQuotesOnly: boolean
    showQuoteSource: boolean
    changeFrequency: "daily" | "weekly" | "monthly"
  }

  // Goal Settings
  goals: {
    defaultDeadlineDays: number
    progressNotificationThreshold: number
    autoCompleteGoals: boolean
    showProgressPercentage: boolean
  }

  // Transaction Settings
  transactions: {
    defaultCategories: string[]
    autoSave: boolean
    confirmDelete: boolean
    showDescriptions: boolean
    defaultTags: string[]
  }

  // Data Management
  data: {
    autoBackup: boolean
    backupFrequency: "daily" | "weekly" | "monthly"
    dataRetentionDays: number
    exportFormat: "csv" | "json"
  }

  // Privacy & Security
  privacy: {
    shareUsageData: boolean
    enableAnalytics: boolean
    dataEncryption: boolean
  }
}

interface ConfigurationsProps {
  transactions: Transaction[]
  goals: Goal[]
  customQuotes: CustomQuote[]
  onConfigChange: (config: AppConfig) => void
  onDataImport: (data: { transactions?: Transaction[]; goals?: Goal[]; customQuotes?: CustomQuote[] }) => void
  onDataClear: () => void
}

const defaultConfig: AppConfig = {
  currency: "USD",
  dateFormat: "MM/DD/YYYY",
  numberFormat: {
    decimalPlaces: 2,
    thousandsSeparator: ",",
  },
  defaultTransactionType: "expense",
  language: "en",
  theme: "light",
  chartAnimations: true,
  defaultChartPeriod: "month",
  dashboardLayout: "detailed",
  showQuickStats: true,
  notifications: {
    enabled: true,
    overspendingAlerts: true,
    goalDeadlineReminders: true,
    weeklyReports: false,
    goalAchievements: true,
    reminderDays: 7,
  },
  quotes: {
    enableCustomQuotes: true,
    customQuotesOnly: false,
    showQuoteSource: true,
    changeFrequency: "weekly",
  },
  goals: {
    defaultDeadlineDays: 365,
    progressNotificationThreshold: 75,
    autoCompleteGoals: false,
    showProgressPercentage: true,
  },
  transactions: {
    defaultCategories: ["Food & Dining", "Transportation", "Shopping", "Bills & Utilities"],
    autoSave: true,
    confirmDelete: true,
    showDescriptions: true,
    defaultTags: ["Essential", "Non-essential"],
  },
  data: {
    autoBackup: false,
    backupFrequency: "weekly",
    dataRetentionDays: 0, // 0 = keep forever
    exportFormat: "csv",
  },
  privacy: {
    shareUsageData: false,
    enableAnalytics: false,
    dataEncryption: false,
  },
}

export function Configurations({
  transactions,
  goals,
  customQuotes,
  onConfigChange,
  onDataImport,
  onDataClear,
}: ConfigurationsProps) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load config from cookies only on client side
  useEffect(() => {
    if (typeof window === "undefined") return

    const loadConfig = () => {
      try {
        const savedConfig = getCookie("finance-app-config")
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          setConfig({ ...defaultConfig, ...parsedConfig })
        }
      } catch (error) {
        console.error("Failed to parse saved config:", error)
      } finally {
        setIsLoaded(true)
      }
    }

    const timer = setTimeout(loadConfig, 100)
    return () => clearTimeout(timer)
  }, [])

  const updateConfig = (updates: Partial<AppConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    setHasUnsavedChanges(true)
  }

  const updateNestedConfig = (section: keyof AppConfig, updates: any) => {
    const newConfig = {
      ...config,
      [section]: { ...config[section], ...updates },
    }
    setConfig(newConfig)
    setHasUnsavedChanges(true)
  }

  const saveConfig = () => {
    setCookie("finance-app-config", JSON.stringify(config))
    onConfigChange(config)
    setHasUnsavedChanges(false)
  }

  const resetConfig = () => {
    setConfig(defaultConfig)
    setHasUnsavedChanges(true)
  }

  const exportData = () => {
    const data = {
      transactions,
      goals,
      customQuotes,
      config,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `finance-app-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        // Validate and import data
        const importData: any = {}
        if (data.transactions && Array.isArray(data.transactions)) {
          importData.transactions = data.transactions
        }
        if (data.goals && Array.isArray(data.goals)) {
          importData.goals = data.goals
        }
        if (data.customQuotes && Array.isArray(data.customQuotes)) {
          importData.customQuotes = data.customQuotes
        }
        if (data.config) {
          setConfig({ ...defaultConfig, ...data.config })
          setHasUnsavedChanges(true)
        }

        onDataImport(importData)
        alert("Data imported successfully!")
      } catch (error) {
        alert("Failed to import data. Please check the file format.")
      }
    }
    reader.readAsText(file)
  }

  const clearAllData = () => {
    onDataClear()
    setConfig(defaultConfig)
    deleteCookie("finance-app-config")
    setHasUnsavedChanges(false)
    setShowClearDialog(false)
    alert("All data cleared successfully!")
  }

  const getDataStats = () => {
    const totalTransactions = transactions.length
    const totalGoals = goals.length
    const totalCustomQuotes = customQuotes.length
    const dataSize = new Blob([JSON.stringify({ transactions, goals, customQuotes })]).size
    const dataSizeKB = Math.round(dataSize / 1024)

    return { totalTransactions, totalGoals, totalCustomQuotes, dataSizeKB }
  }

  // Show loading state until config is loaded
  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  const stats = getDataStats()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">App Configuration</h2>
          <p className="text-sm text-muted-foreground">Customize your personal finance app experience</p>
        </div>
        <div className="flex gap-2">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Unsaved Changes
            </Badge>
          )}
          <Button onClick={resetConfig} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveConfig} size="sm" disabled={!hasUnsavedChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="general" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-1">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Display</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="quotes" className="flex items-center gap-1">
            <Quote className="h-4 w-4" />
            <span className="hidden sm:inline">Quotes</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Goals</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regional Settings
              </CardTitle>
              <CardDescription>Configure currency, date format, and language preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={config.currency} onValueChange={(value) => updateConfig({ currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select value={config.dateFormat} onValueChange={(value) => updateConfig({ dateFormat: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Decimal Places</Label>
                  <Select
                    value={config.numberFormat.decimalPlaces.toString()}
                    onValueChange={(value) =>
                      updateNestedConfig("numberFormat", { decimalPlaces: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 (1234)</SelectItem>
                      <SelectItem value="2">2 (1234.00)</SelectItem>
                      <SelectItem value="3">3 (1234.000)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Transaction Type</Label>
                  <Select
                    value={config.defaultTransactionType}
                    onValueChange={(value: "income" | "expense") => updateConfig({ defaultTransactionType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Settings */}
        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Display Preferences
              </CardTitle>
              <CardDescription>Customize the appearance and layout of your app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Dashboard Layout</Label>
                  <Select
                    value={config.dashboardLayout}
                    onValueChange={(value: "compact" | "detailed") => updateConfig({ dashboardLayout: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Chart Period</Label>
                  <Select
                    value={config.defaultChartPeriod}
                    onValueChange={(value) => updateConfig({ defaultChartPeriod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Chart Animations</Label>
                    <p className="text-sm text-muted-foreground">Enable smooth animations in charts</p>
                  </div>
                  <Switch
                    checked={config.chartAnimations}
                    onCheckedChange={(checked) => updateConfig({ chartAnimations: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Quick Stats</Label>
                    <p className="text-sm text-muted-foreground">Display quick statistics in sidebar</p>
                  </div>
                  <Switch
                    checked={config.showQuickStats}
                    onCheckedChange={(checked) => updateConfig({ showQuickStats: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure alerts and reminders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Master switch for all notifications</p>
                </div>
                <Switch
                  checked={config.notifications.enabled}
                  onCheckedChange={(checked) => updateNestedConfig("notifications", { enabled: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Overspending Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alert when expenses exceed income</p>
                  </div>
                  <Switch
                    checked={config.notifications.overspendingAlerts}
                    onCheckedChange={(checked) => updateNestedConfig("notifications", { overspendingAlerts: checked })}
                    disabled={!config.notifications.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Goal Deadline Reminders</Label>
                    <p className="text-sm text-muted-foreground">Remind about approaching goal deadlines</p>
                  </div>
                  <Switch
                    checked={config.notifications.goalDeadlineReminders}
                    onCheckedChange={(checked) =>
                      updateNestedConfig("notifications", { goalDeadlineReminders: checked })
                    }
                    disabled={!config.notifications.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Goal Achievements</Label>
                    <p className="text-sm text-muted-foreground">Celebrate when goals are completed</p>
                  </div>
                  <Switch
                    checked={config.notifications.goalAchievements}
                    onCheckedChange={(checked) => updateNestedConfig("notifications", { goalAchievements: checked })}
                    disabled={!config.notifications.enabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reminder Days Before Deadline</Label>
                  <Select
                    value={config.notifications.reminderDays.toString()}
                    onValueChange={(value) =>
                      updateNestedConfig("notifications", { reminderDays: Number.parseInt(value) })
                    }
                    disabled={!config.notifications.enabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quote Settings */}
        <TabsContent value="quotes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className="h-5 w-5" />
                Motivational Quotes
              </CardTitle>
              <CardDescription>Configure how motivational quotes are displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Custom Quotes</Label>
                  <p className="text-sm text-muted-foreground">Include your custom quotes in rotation</p>
                </div>
                <Switch
                  checked={config.quotes.enableCustomQuotes}
                  onCheckedChange={(checked) => updateNestedConfig("quotes", { enableCustomQuotes: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Custom Quotes Only</Label>
                  <p className="text-sm text-muted-foreground">Show only your custom quotes</p>
                </div>
                <Switch
                  checked={config.quotes.customQuotesOnly}
                  onCheckedChange={(checked) => updateNestedConfig("quotes", { customQuotesOnly: checked })}
                  disabled={!config.quotes.enableCustomQuotes}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Quote Source</Label>
                  <p className="text-sm text-muted-foreground">Display author attribution</p>
                </div>
                <Switch
                  checked={config.quotes.showQuoteSource}
                  onCheckedChange={(checked) => updateNestedConfig("quotes", { showQuoteSource: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Quote Change Frequency</Label>
                <Select
                  value={config.quotes.changeFrequency}
                  onValueChange={(value: "daily" | "weekly" | "monthly") =>
                    updateNestedConfig("quotes", { changeFrequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <Quote className="h-4 w-4" />
                <AlertDescription>
                  You have <strong>{customQuotes.length}</strong> custom quote{customQuotes.length !== 1 ? "s" : ""}{" "}
                  that will be included in the rotation.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goal Settings */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goal Management
              </CardTitle>
              <CardDescription>Configure default goal settings and behaviors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Deadline (Days)</Label>
                  <Select
                    value={config.goals.defaultDeadlineDays.toString()}
                    onValueChange={(value) =>
                      updateNestedConfig("goals", { defaultDeadlineDays: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">6 months</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="730">2 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Progress Notification (%)</Label>
                  <Select
                    value={config.goals.progressNotificationThreshold.toString()}
                    onValueChange={(value) =>
                      updateNestedConfig("goals", { progressNotificationThreshold: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50%</SelectItem>
                      <SelectItem value="75">75%</SelectItem>
                      <SelectItem value="90">90%</SelectItem>
                      <SelectItem value="95">95%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Complete Goals</Label>
                    <p className="text-sm text-muted-foreground">Automatically mark goals as complete when reached</p>
                  </div>
                  <Switch
                    checked={config.goals.autoCompleteGoals}
                    onCheckedChange={(checked) => updateNestedConfig("goals", { autoCompleteGoals: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Progress Percentage</Label>
                    <p className="text-sm text-muted-foreground">Display percentage alongside progress bars</p>
                  </div>
                  <Switch
                    checked={config.goals.showProgressPercentage}
                    onCheckedChange={(checked) => updateNestedConfig("goals", { showProgressPercentage: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction Settings */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Transaction Preferences
              </CardTitle>
              <CardDescription>Configure transaction defaults and behaviors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Save Transactions</Label>
                    <p className="text-sm text-muted-foreground">Automatically save transactions to local storage</p>
                  </div>
                  <Switch
                    checked={config.transactions.autoSave}
                    onCheckedChange={(checked) => updateNestedConfig("transactions", { autoSave: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Confirm Before Delete</Label>
                    <p className="text-sm text-muted-foreground">Show confirmation dialog when deleting transactions</p>
                  </div>
                  <Switch
                    checked={config.transactions.confirmDelete}
                    onCheckedChange={(checked) => updateNestedConfig("transactions", { confirmDelete: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Descriptions</Label>
                    <p className="text-sm text-muted-foreground">Display transaction descriptions in lists</p>
                  </div>
                  <Switch
                    checked={config.transactions.showDescriptions}
                    onCheckedChange={(checked) => updateNestedConfig("transactions", { showDescriptions: checked })}
                  />
                </div>
              </div>

              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  You have <strong>{transactions.length}</strong> transaction{transactions.length !== 1 ? "s" : ""} in
                  your database.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>Backup, restore, and manage your financial data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select
                    value={config.data.exportFormat}
                    onValueChange={(value: "csv" | "json") => updateNestedConfig("data", { exportFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data Retention</Label>
                  <Select
                    value={config.data.dataRetentionDays.toString()}
                    onValueChange={(value) => updateNestedConfig("data", { dataRetentionDays: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Keep Forever</SelectItem>
                      <SelectItem value="365">1 Year</SelectItem>
                      <SelectItem value="730">2 Years</SelectItem>
                      <SelectItem value="1095">3 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button onClick={exportData} variant="outline" className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Data
                  </Button>
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      style={{ display: "none" }}
                      id="import-file"
                    />
                    <Button
                      onClick={() => document.getElementById("import-file")?.click()}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                  </div>
                </div>

                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div>
                        Data Size: <strong>{stats.dataSizeKB} KB</strong>
                      </div>
                      <div>
                        Transactions: <strong>{stats.totalTransactions}</strong> | Goals:{" "}
                        <strong>{stats.totalGoals}</strong> | Custom Quotes: <strong>{stats.totalCustomQuotes}</strong>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear All Data</DialogTitle>
                      <DialogDescription>
                        This will permanently delete all your transactions, goals, custom quotes, and settings. This
                        action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={clearAllData}>
                        Delete Everything
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Control your privacy and data security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Share Usage Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the app by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch
                    checked={config.privacy.shareUsageData}
                    onCheckedChange={(checked) => updateNestedConfig("privacy", { shareUsageData: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Analytics</Label>
                    <p className="text-sm text-muted-foreground">Allow analytics to track app performance</p>
                  </div>
                  <Switch
                    checked={config.privacy.enableAnalytics}
                    onCheckedChange={(checked) => updateNestedConfig("privacy", { enableAnalytics: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Encryption</Label>
                    <p className="text-sm text-muted-foreground">Encrypt sensitive data in local storage</p>
                  </div>
                  <Switch
                    checked={config.privacy.dataEncryption}
                    onCheckedChange={(checked) => updateNestedConfig("privacy", { dataEncryption: checked })}
                  />
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  All your financial data is stored locally on your device. No data is sent to external servers unless
                  you explicitly enable data sharing options above.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
