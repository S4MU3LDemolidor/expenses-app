"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Plus,
  PieChart,
  Menu,
  Home,
  BarChart3,
  Lightbulb,
  Moon,
  Sun,
  Bell,
  Clock,
  List,
  Download,
  Quote,
} from "lucide-react"
import { useTheme } from "next-themes"
import { AddIncomeForm } from "@/components/add-income-form"
import { AddExpenseForm } from "@/components/add-expense-form"
import { ExpenseChart } from "@/components/expense-chart"
import { IncomeVsExpenseChart } from "@/components/income-vs-expense-chart"
import { GoalTracker } from "@/components/goal-tracker"
import { SuggestionsPanel } from "@/components/suggestions-panel"
import { TransactionsList } from "@/components/transactions-list"
import { ExportButtons } from "@/components/export-buttons"
import { CustomQuotesManager, type CustomQuote } from "@/components/custom-quotes-manager"
import { Configurations, type AppConfig } from "@/components/configurations"

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

export interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  date: string
  source?: string
  category?: string
  description?: string
  tags: string[]
}

export interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: string
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "transactions", label: "Transactions", icon: List },
  { id: "add-income", label: "Add Income", icon: TrendingUp },
  { id: "add-expense", label: "Add Expense", icon: TrendingDown },
  { id: "overview", label: "Charts & Analytics", icon: BarChart3 },
  { id: "goals", label: "Goals", icon: Target },
  { id: "insights", label: "Insights", icon: Lightbulb },
  { id: "export", label: "Export Data", icon: Download },
  { id: "custom-quotes", label: "Custom Quotes", icon: Quote },
]

export default function FinanceTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [customQuotes, setCustomQuotes] = useState<CustomQuote[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from cookies only on client side
  useEffect(() => {
    if (typeof window === "undefined") return

    const loadData = () => {
      try {
        const savedTransactions = getCookie("finance-transactions")
        const savedGoals = getCookie("finance-goals")
        const savedCustomQuotes = getCookie("finance-custom-quotes")

        if (savedTransactions) {
          const parsedTransactions = JSON.parse(savedTransactions)
          setTransactions(parsedTransactions)
        }
        if (savedGoals) {
          const parsedGoals = JSON.parse(savedGoals)
          setGoals(parsedGoals)
        }
        if (savedCustomQuotes) {
          const parsedCustomQuotes = JSON.parse(savedCustomQuotes)
          setCustomQuotes(parsedCustomQuotes)
        }
      } catch (error) {
        console.error("Failed to parse data from cookies:", error)
      } finally {
        setIsLoaded(true)
      }
    }

    // Use a small delay to ensure hydration is complete
    const timer = setTimeout(loadData, 100)
    return () => clearTimeout(timer)
  }, [])

  // Save to cookies whenever data changes (only after initial load)
  useEffect(() => {
    if (!isLoaded) return
    setCookie("finance-transactions", JSON.stringify(transactions))
  }, [transactions, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    setCookie("finance-goals", JSON.stringify(goals))
  }, [goals, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    setCookie("finance-custom-quotes", JSON.stringify(customQuotes))
  }, [customQuotes, isLoaded])

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions((prev) => [...prev, newTransaction])
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)))
  }

  const addGoal = (goal: Omit<Goal, "id">) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
    }
    setGoals((prev) => [...prev, newGoal])
  }

  const updateGoal = (goalId: string, currentAmount: number) => {
    setGoals((prev) => prev.map((goal) => (goal.id === goalId ? { ...goal, currentAmount } : goal)))
  }

  const addCustomQuote = (quote: Omit<CustomQuote, "id">) => {
    const newQuote = {
      ...quote,
      id: Date.now().toString(),
    }
    setCustomQuotes((prev) => [...prev, newQuote])
  }

  const updateCustomQuote = (id: string, quote: Omit<CustomQuote, "id" | "dateAdded">) => {
    setCustomQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, ...quote } : q)))
  }

  const deleteCustomQuote = (id: string) => {
    setCustomQuotes((prev) => prev.filter((q) => q.id !== id))
  }

  const handleConfigChange = (config: AppConfig) => {
    // Apply theme change if it's different
    if (config.theme !== theme) {
      setTheme(config.theme === "system" ? "system" : config.theme)
    }
  }

  const handleDataImport = (data: { transactions?: Transaction[]; goals?: Goal[]; customQuotes?: CustomQuote[] }) => {
    if (data.transactions) {
      setTransactions(data.transactions)
    }
    if (data.goals) {
      setGoals(data.goals)
    }
    if (data.customQuotes) {
      setCustomQuotes(data.customQuotes)
    }
  }

  const handleDataClear = () => {
    setTransactions([])
    setGoals([])
    setCustomQuotes([])
    deleteCookie("finance-transactions")
    deleteCookie("finance-goals")
    deleteCookie("finance-custom-quotes")
  }

  const handleNavigation = (sectionId: string) => {
    setActiveSection(sectionId)
    setIsMenuOpen(false)
  }

  // Show loading state until data is loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    )
  }

  // Calculate totals
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const currentBalance = totalIncome - totalExpenses
  const isOverspending = totalExpenses > totalIncome

  // Get expense categories for suggestions
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        const category = t.category || "Other"
        acc[category] = (acc[category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )

  // Get recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Calculate notifications
  const getNotifications = () => {
    const notifications = []

    // Overspending notification
    if (isOverspending) {
      notifications.push({
        type: "overspending",
        message: "Expenses exceed income",
        severity: "high",
      })
    }

    // Goals notifications
    const now = new Date()
    goals.forEach((goal) => {
      const deadline = new Date(goal.deadline)
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const progress = (goal.currentAmount / goal.targetAmount) * 100

      // Goal can be completed
      if (currentBalance >= goal.targetAmount - goal.currentAmount && progress < 100) {
        notifications.push({
          type: "goal-achievable",
          message: `You can complete "${goal.title}"`,
          severity: "medium",
        })
      }

      // Goal deadline approaching
      if (daysUntilDeadline <= 7 && daysUntilDeadline > 0 && progress < 100) {
        notifications.push({
          type: "goal-deadline",
          message: `"${goal.title}" due in ${daysUntilDeadline} days`,
          severity: "medium",
        })
      }

      // Goal overdue
      if (daysUntilDeadline < 0 && progress < 100) {
        notifications.push({
          type: "goal-overdue",
          message: `"${goal.title}" is overdue`,
          severity: "high",
        })
      }
    })

    return notifications
  }

  const notifications = getNotifications()
  const highPriorityNotifications = notifications.filter((n) => n.severity === "high").length

  const getCurrentSectionTitle = () => {
    const currentItem = navigationItems.find((item) => item.id === activeSection)
    return currentItem?.label || "Dashboard"
  }

  const getMenuItemBadgeCount = (itemId: string) => {
    switch (itemId) {
      case "goals":
        return notifications.filter((n) => n.type.includes("goal")).length
      case "insights":
        return notifications.filter((n) => n.type === "overspending").length
      case "transactions":
        return transactions.length > 0 ? transactions.length : 0
      default:
        return 0
    }
  }

  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Financial Overview Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                  <DollarSign className={`h-4 w-4 ${currentBalance >= 0 ? "text-green-600" : "text-red-600"}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${currentBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ${currentBalance.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  {isOverspending ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Target className="h-4 w-4 text-green-600" />
                  )}
                </CardHeader>
                <CardContent>
                  <Badge variant={isOverspending ? "destructive" : "default"}>
                    {isOverspending ? "Overspending" : "On Track"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="space-y-2">
                {notifications.slice(0, 3).map((notification, index) => (
                  <Alert key={index} variant={notification.severity === "high" ? "destructive" : "default"}>
                    <Bell className="h-4 w-4" />
                    <AlertDescription>{notification.message}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => handleNavigation("add-income")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Add Income
                  </Button>
                  <Button
                    onClick={() => handleNavigation("add-expense")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                  <Button onClick={() => handleNavigation("goals")} className="w-full justify-start" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Set Goal
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Spending Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(expensesByCategory).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(expensesByCategory)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([category, amount]) => (
                          <div key={category} className="flex justify-between items-center">
                            <span className="text-sm">{category}</span>
                            <span className="font-medium">${amount.toFixed(2)}</span>
                          </div>
                        ))}
                      <Button onClick={() => handleNavigation("overview")} variant="link" className="w-full p-0 h-auto">
                        View detailed breakdown →
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No expenses recorded yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "transactions":
        return (
          <TransactionsList
            transactions={transactions}
            onDeleteTransaction={deleteTransaction}
            onUpdateTransaction={updateTransaction}
          />
        )

      case "add-income":
        return <AddIncomeForm onAddTransaction={addTransaction} />

      case "add-expense":
        return <AddExpenseForm onAddTransaction={addTransaction} />

      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <ExpenseChart transactions={transactions} />
              <IncomeVsExpenseChart transactions={transactions} />
            </div>
          </div>
        )

      case "goals":
        return (
          <GoalTracker goals={goals} onAddGoal={addGoal} onUpdateGoal={updateGoal} currentBalance={currentBalance} />
        )

      case "export":
        return <ExportButtons transactions={transactions} goals={goals} />

      case "custom-quotes":
        return (
          <CustomQuotesManager
            customQuotes={customQuotes}
            onAddQuote={addCustomQuote}
            onUpdateQuote={updateCustomQuote}
            onDeleteQuote={deleteCustomQuote}
          />
        )

      case "settings":
        return (
          <Configurations
            transactions={transactions}
            goals={goals}
            customQuotes={customQuotes}
            onConfigChange={handleConfigChange}
            onDataImport={handleDataImport}
            onDataClear={handleDataClear}
          />
        )

      case "insights":
        return (
          <SuggestionsPanel
            transactions={transactions}
            expensesByCategory={expensesByCategory}
            isOverspending={isOverspending}
            customQuotes={customQuotes}
          />
        )

      default:
        return <div>Section not found</div>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-3 relative">
                <Menu className="h-5 w-5" />
                {highPriorityNotifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {highPriorityNotifications}
                  </Badge>
                )}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] sm:w-[380px] overflow-y-auto p-4 sm:p-6">
              <SheetHeader>
                <SheetTitle className="text-left">Navigation</SheetTitle>
              </SheetHeader>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <span className="text-sm font-medium">Dark Mode</span>
                  <Moon className="h-4 w-4" />
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>

              <Separator className="my-4" />

              {/* Navigation */}
              <nav className="mt-4">
                <div className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const badgeCount = getMenuItemBadgeCount(item.id)
                    return (
                      <Button
                        key={item.id}
                        variant={activeSection === item.id ? "default" : "ghost"}
                        className="w-full justify-start relative h-10 px-3"
                        onClick={() => handleNavigation(item.id)}
                      >
                        <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {badgeCount > 0 && item.id === "transactions" && (
                          <Badge
                            variant="secondary"
                            className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs flex-shrink-0"
                          >
                            {badgeCount}
                          </Badge>
                        )}
                        {badgeCount > 0 && item.id !== "transactions" && (
                          <Badge
                            variant="secondary"
                            className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs flex-shrink-0"
                          >
                            {badgeCount}
                          </Badge>
                        )}
                      </Button>
                    )
                  })}
                </div>
              </nav>

              <Separator className="my-4" />

              {/* Notifications */}
              {notifications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications ({notifications.length})
                  </h3>
                  <div className="space-y-2">
                    {notifications.slice(0, 3).map((notification, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg text-xs ${
                          notification.severity === "high"
                            ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {notification.message}
                      </div>
                    ))}
                    {notifications.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{notifications.length - 3} more notifications</p>
                    )}
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              {/* Recent Transactions */}
              {recentTransactions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Transactions
                  </h3>
                  <div className="space-y-2">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center space-x-2">
                          {transaction.type === "income" ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          )}
                          <div>
                            <div className="text-xs font-medium">
                              {transaction.source || transaction.category || "Transaction"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatTransactionDate(transaction.date)}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`text-xs font-medium ${
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              {/* Quick Stats */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Balance:</span>
                    <span className={`font-medium ${currentBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${currentBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Income:</span>
                    <span className="font-medium text-green-600">${totalIncome.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Expenses:</span>
                    <span className="font-medium text-red-600">${totalExpenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Transactions:</span>
                    <span className="font-medium">{transactions.length}</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Personal Finance Tracker</h1>
              <p className="text-sm text-muted-foreground">{getCurrentSectionTitle()}</p>
            </div>

            {/* Quick Balance Display */}
            <div className="hidden sm:flex items-center space-x-4 text-sm">
              {notifications.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary" className="text-xs">
                    {notifications.length}
                  </Badge>
                </div>
              )}
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Balance</div>
                <div className={`font-medium ${currentBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${currentBalance.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6">{renderContent()}</main>
    </div>
  )
}
