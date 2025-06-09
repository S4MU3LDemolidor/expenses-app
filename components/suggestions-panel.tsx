"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Lightbulb,
  TrendingDown,
  AlertTriangle,
  Target,
  DollarSign,
  Calendar,
  Share2,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react"
import type { Transaction } from "@/app/page"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { CustomQuote } from "./custom-quotes-manager"

interface SuggestionsPanelProps {
  transactions: Transaction[]
  expensesByCategory: Record<string, number>
  isOverspending: boolean
  customQuotes: CustomQuote[]
}

const weeklyMotivations = [
  // Week 1
  "A penny saved is a penny earned. - Benjamin Franklin",
  // Week 2
  "It's not how much money you make, but how much money you keep. - Robert Kiyosaki",
  // Week 3
  "The habit of saving is itself an education. - T.T. Munger",
  // Week 4
  "Don't save what is left after spending; spend what is left after saving. - Warren Buffett",
  // Week 5
  "Small amounts saved daily add up to huge investments over time. - Unknown",
  // Week 6
  "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make. - Dave Ramsey",
  // Week 7
  "The real measure of your wealth is how much you'd be worth if you lost all your money. - Anonymous",
  // Week 8
  "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver. - Ayn Rand",
  // Week 9
  "The stock market is filled with individuals who know the price of everything, but the value of nothing. - Philip Fisher",
  // Week 10
  "An investment in knowledge pays the best interest. - Benjamin Franklin",
  // Week 11
  "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
  // Week 12
  "Do not put all your eggs in one basket. - Proverb",
  // Week 13
  "Rich people have small TVs and big libraries, and poor people have small libraries and big TVs. - Zig Ziglar",
  // Week 14
  "The goal isn't more money. The goal is living life on your terms. - Chris Brogan",
  // Week 15
  "Wealth consists not in having great possessions, but in having few wants. - Epictetus",
  // Week 16
  "Time is more valuable than money. You can get more money, but you cannot get more time. - Jim Rohn",
  // Week 17
  "The quickest way to double your money is to fold it in half and put it in your back pocket. - Frank Hubbard",
  // Week 18
  "Money grows on the tree of persistence. - Japanese Proverb",
  // Week 19
  "A budget is telling your money where to go instead of wondering where it went. - Dave Ramsey",
  // Week 20
  "The art is not in making money, but in keeping it. - Proverb",
  // Week 21
  "Beware of little expenses. A small leak will sink a great ship. - Benjamin Franklin",
  // Week 22
  "Money is a terrible master but an excellent servant. - P.T. Barnum",
  // Week 23
  "The lack of money is the root of all evil. - Mark Twain",
  // Week 24
  "Formal education will make you a living; self-education will make you a fortune. - Jim Rohn",
  // Week 25
  "The person who doesn't know where his next dollar is coming from usually doesn't know where his last dollar went. - Unknown",
  // Week 26
  "If you would be wealthy, think of saving as well as getting. - Benjamin Franklin",
  // Week 27
  "Money never made a man happy yet, nor will it. The more a man has, the more he wants. - Benjamin Franklin",
  // Week 28
  "The safe way to double your money is to fold it over once and put it in your pocket. - Frank Hubbard",
  // Week 29
  "Wealth is not about having a lot of money; it's about having a lot of options. - Chris Rock",
  // Week 30
  "The most important investment you can make is in yourself. - Warren Buffett",
  // Week 31
  "Don't work for money; make money work for you. - Robert Kiyosaki",
  // Week 32
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  // Week 33
  "Financial freedom is available to those who learn about it and work for it. - Robert Kiyosaki",
  // Week 34
  "It's not what you earn, it's what you keep. - Unknown",
  // Week 35
  "The first rule of compounding: Never interrupt it unnecessarily. - Charlie Munger",
  // Week 36
  "Price is what you pay. Value is what you get. - Warren Buffett",
  // Week 37
  "The biggest risk is not taking any risk. - Mark Zuckerberg",
  // Week 38
  "Your net worth to the network is your net worth. - Tim O'Reilly",
  // Week 39
  "Money is multiplied in practical value depending on the number of W's you control in your life: what you do, when you do it, where you do it, and with whom you do it. - Tim Ferriss",
  // Week 40
  "The four most expensive words in the English language are 'This time it's different.' - Sir John Templeton",
  // Week 41
  "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it. - Albert Einstein",
  // Week 42
  "Risk comes from not knowing what you're doing. - Warren Buffett",
  // Week 43
  "The stock market is a device for transferring money from the impatient to the patient. - Warren Buffett",
  // Week 44
  "Never spend your money before you have earned it. - Thomas Jefferson",
  // Week 45
  "A wise person should have money in their head, but not in their heart. - Jonathan Swift",
  // Week 46
  "Money is not the most important thing in the world. Love is. Fortunately, I love money. - Jackie Mason",
  // Week 47
  "The real measure of your wealth is how much you'd be worth if you lost all your money. - Anonymous",
  // Week 48
  "Every time you borrow money, you're robbing your future self. - Nathan W. Morris",
  // Week 49
  "The habit of saving is itself an education; it fosters every virtue, teaches self-denial, cultivates the sense of order, trains to forethought, and so broadens the mind. - T.T. Munger",
  // Week 50
  "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver. - Ayn Rand",
  // Week 51
  "The secret to wealth is simple: Find a way to do more for others than anyone else does. - Tony Robbins",
  // Week 52
  "Success is not just about what you accomplish in your life, it's about what you inspire others to do. - Unknown",
]

const savingsTips = [
  "Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
  "Use the envelope method for discretionary spending",
  "Automate your savings to make it effortless",
  "Review subscriptions monthly and cancel unused ones",
  "Cook at home more often to reduce food expenses",
  "Compare prices before making large purchases",
  "Set up a separate emergency fund for unexpected expenses",
  "Use cashback apps and credit cards responsibly",
  "Buy generic brands instead of name brands",
  "Plan your meals and make a grocery list",
  "Use public transportation or carpool when possible",
  "Take advantage of free entertainment options",
  "Negotiate bills like phone, internet, and insurance",
  "Buy items during sales and use coupons",
  "Consider buying used items for big purchases",
  "Track your spending to identify money leaks",
  "Set up automatic transfers to savings accounts",
  "Use the 24-hour rule before making impulse purchases",
  "Invest in energy-efficient appliances to save long-term",
  "Consider a side hustle to increase income",
]

export function SuggestionsPanel({
  transactions,
  expensesByCategory,
  isOverspending,
  customQuotes,
}: SuggestionsPanelProps) {
  const getTopExpenseCategories = () => {
    return Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
  }

  const getUnusualExpenses = () => {
    const recentExpenses = transactions
      .filter((t) => t.type === "expense")
      .filter((t) => {
        const transactionDate = new Date(t.date)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return transactionDate >= thirtyDaysAgo
      })

    const avgExpense = recentExpenses.reduce((sum, t) => sum + t.amount, 0) / recentExpenses.length || 0

    return recentExpenses
      .filter((t) => t.amount > avgExpense * 2)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)
  }

  const getWeeklyMotivation = () => {
    // Get the current date
    const now = new Date()

    // Calculate the week number of the year
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)

    // Combine default quotes with custom quotes
    const allQuotes = [...weeklyMotivations, ...customQuotes.map((q) => `${q.text} - ${q.author}`)]

    // Use modulo to cycle through all motivations
    const motivationIndex = (weekNumber - 1) % allQuotes.length

    return {
      quote: allQuotes[motivationIndex],
      weekNumber: weekNumber,
      isCustom: motivationIndex >= weeklyMotivations.length,
    }
  }

  const getRandomTip = () => {
    return savingsTips[Math.floor(Math.random() * savingsTips.length)]
  }

  const handleShareQuote = (platform: string, quote: string) => {
    const text = `"${quote}" - Weekly Financial Motivation`
    const url = window.location.href

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank",
        )
        break
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
          "_blank",
        )
        break
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
          "_blank",
        )
        break
      case "copy":
        navigator.clipboard.writeText(text).then(() => {
          alert("Quote copied to clipboard!")
        })
        break
    }
  }

  const topCategories = getTopExpenseCategories()
  const unusualExpenses = getUnusualExpenses()
  const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0)
  const weeklyMotivation = getWeeklyMotivation()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Financial Insights</h2>
        <p className="text-sm text-muted-foreground">Personalized suggestions to improve your financial health</p>
      </div>

      {/* Overspending Alert */}
      {isOverspending && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Action Required:</strong> Your expenses exceed your income. Consider reducing spending in your top
            expense categories or finding ways to increase your income.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        {/* Top Categories to Cut Back */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Top Categories to Review
            </CardTitle>
            <CardDescription>Your highest spending categories this period</CardDescription>
          </CardHeader>
          <CardContent>
            {topCategories.length > 0 ? (
              <div className="space-y-4">
                {topCategories.map(([category, amount], index) => {
                  const percentage = (amount / totalExpenses) * 100
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={index === 0 ? "destructive" : "secondary"}>#{index + 1}</Badge>
                          <span className="font-medium">{category}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">${amount.toFixed(2)}</span>
                        {index === 0 && (
                          <Badge variant="outline" className="text-xs">
                            Highest spending
                          </Badge>
                        )}
                      </div>
                      {index === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Consider reducing this category by 10-20% to improve your budget
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No expense data available</p>
            )}
          </CardContent>
        </Card>

        {/* Unusual Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Unusual Expenses
            </CardTitle>
            <CardDescription>Large expenses from the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {unusualExpenses.length > 0 ? (
              <div className="space-y-3">
                {unusualExpenses.map((expense) => (
                  <div key={expense.id} className="border rounded-lg p-2 sm:p-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base truncate">{expense.category}</div>
                        {expense.description && (
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">{expense.description}</div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right sm:text-left flex sm:flex-col justify-between sm:justify-start items-end sm:items-end">
                        <div className="font-bold text-red-600 text-sm sm:text-base">${expense.amount.toFixed(2)}</div>
                        <Badge variant="outline" className="text-xs">
                          Large expense
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No unusual expenses detected</p>
            )}
          </CardContent>
        </Card>

        {/* Weekly Motivation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Weekly Motivation
                  {weeklyMotivation.isCustom && (
                    <Badge variant="secondary" className="text-xs">
                      Custom
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Week {weeklyMotivation.weekNumber} of {new Date().getFullYear()}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleShareQuote("copy", weeklyMotivation.quote)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Quote
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShareQuote("twitter", weeklyMotivation.quote)}>
                    <Twitter className="h-4 w-4 mr-2" />
                    Share on Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShareQuote("facebook", weeklyMotivation.quote)}>
                    <Facebook className="h-4 w-4 mr-2" />
                    Share on Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShareQuote("linkedin", weeklyMotivation.quote)}>
                    <Linkedin className="h-4 w-4 mr-2" />
                    Share on LinkedIn
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <blockquote className="italic text-muted-foreground border-l-4 border-blue-500 pl-4">
              &ldquo;{weeklyMotivation.quote}&rdquo;
            </blockquote>
            <div className="mt-3 text-xs text-muted-foreground">
              This motivation changes every week to keep you inspired on your financial journey.
              {weeklyMotivation.isCustom && " This is one of your custom quotes!"}
            </div>
          </CardContent>
        </Card>

        {/* Savings Tip */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Savings Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{getRandomTip()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Financial Health Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center">
            <div>
              <div className="text-lg sm:text-2xl font-bold text-blue-600">
                {Object.keys(expensesByCategory).length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Expense Categories</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-green-600">
                {transactions.filter((t) => t.type === "income").length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Income Sources</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-purple-600">{transactions.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Transactions</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-orange-600">
                {
                  transactions.filter((t) => {
                    const date = new Date(t.date)
                    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    return date >= thirtyDaysAgo
                  }).length
                }
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Last 30 Days</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
