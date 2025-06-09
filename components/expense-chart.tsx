"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useState } from "react"
import type { Transaction } from "@/app/page"
import { PieChartIcon, BarChart3 } from "lucide-react"

interface ExpenseChartProps {
  transactions: Transaction[]
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
]

export function ExpenseChart({ transactions }: ExpenseChartProps) {
  const [timeFilter, setTimeFilter] = useState("all")
  const [chartType, setChartType] = useState<"pie" | "bar">("pie")

  const filterTransactionsByTime = (transactions: Transaction[]) => {
    const now = new Date()
    const filtered = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      switch (timeFilter) {
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return transactionDate >= weekAgo
        case "month":
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          return transactionDate >= monthAgo
        case "year":
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          return transactionDate >= yearAgo
        default:
          return true
      }
    })
    return filtered
  }

  const expenses = filterTransactionsByTime(transactions).filter((t) => t.type === "expense")

  const expensesByCategory = expenses.reduce(
    (acc, expense) => {
      const category = expense.category || "Other"
      acc[category] = (acc[category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.entries(expensesByCategory)
    .map(([category, amount], index) => ({
      category,
      amount,
      fill: COLORS[index % COLORS.length],
    }))
    .sort((a, b) => b.amount - a.amount)

  const totalExpenses = chartData.reduce((sum, item) => sum + item.amount, 0)
  const highestCategory = chartData[0]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              {chartType === "pie" ? (
                <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              Expenses by Category
            </CardTitle>
            <CardDescription className="text-sm">
              {highestCategory && `Highest: ${highestCategory.category} ($${highestCategory.amount.toFixed(2)})`}
            </CardDescription>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <Select value={chartType} onValueChange={(value: "pie" | "bar") => setChartType(value)}>
              <SelectTrigger className="w-20 sm:w-24 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">Pie</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-24 sm:w-32 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "pie" ? (
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Category</span>
                                <span className="font-bold text-muted-foreground">{data.category}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Amount</span>
                                <span className="font-bold">${data.amount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Pie
                    data={chartData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry) => (
                      <Cell key={`cell-${entry.category}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Category</span>
                                <span className="font-bold text-muted-foreground">{label}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Amount</span>
                                <span className="font-bold">
                                  $
                                  {typeof payload[0].value === "number"
                                    ? payload[0].value.toFixed(2)
                                    : payload[0].value}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No expense data available for the selected period
          </div>
        )}

        {chartData.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium">Total Expenses: ${totalExpenses.toFixed(2)}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs">
              {chartData.slice(0, 6).map((item) => (
                <div key={item.category} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="truncate">
                    {item.category}: ${item.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
