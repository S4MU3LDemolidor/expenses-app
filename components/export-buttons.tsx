"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, Database, Filter } from "lucide-react"
import { Target } from "lucide-react" // Import Target icon
import type { Transaction, Goal } from "@/app/page"

interface ExportButtonsProps {
  transactions: Transaction[]
  goals: Goal[]
}

export function ExportButtons({ transactions, goals }: ExportButtonsProps) {
  const [exportFormat, setExportFormat] = useState("csv")
  const [dateRange, setDateRange] = useState("all")
  const [dataType, setDataType] = useState("transactions")

  const filterTransactionsByDate = (transactions: Transaction[]) => {
    const now = new Date()
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      switch (dateRange) {
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
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            // Handle arrays (like tags) and escape commas
            if (Array.isArray(value)) {
              return `"${value.join("; ")}"`
            }
            return typeof value === "string" && value.includes(",") ? `"${value}"` : value
          })
          .join(","),
      ),
    ].join("\n")

    downloadFile(csvContent, filename, "text/csv")
  }

  const exportToJSON = (data: any[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2)
    downloadFile(jsonContent, filename, "application/json")
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    const timestamp = new Date().toISOString().split("T")[0]
    let data: any[] = []
    let filename = ""

    if (dataType === "transactions") {
      const filteredTransactions = filterTransactionsByDate(transactions)
      data = filteredTransactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        date: t.date,
        source: t.source || "",
        category: t.category || "",
        description: t.description || "",
        tags: t.tags,
      }))
      filename = `transactions_${dateRange}_${timestamp}.${exportFormat}`
    } else if (dataType === "goals") {
      data = goals.map((g) => ({
        id: g.id,
        title: g.title,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        deadline: g.deadline,
        progress: ((g.currentAmount / g.targetAmount) * 100).toFixed(2) + "%",
      }))
      filename = `goals_${timestamp}.${exportFormat}`
    } else if (dataType === "summary") {
      const filteredTransactions = filterTransactionsByDate(transactions)
      const totalIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = filteredTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0)
      const balance = totalIncome - totalExpenses

      // Expenses by category
      const expensesByCategory = filteredTransactions
        .filter((t) => t.type === "expense")
        .reduce(
          (acc, t) => {
            const category = t.category || "Other"
            acc[category] = (acc[category] || 0) + t.amount
            return acc
          },
          {} as Record<string, number>,
        )

      data = [
        {
          metric: "Total Income",
          value: totalIncome,
          period: dateRange,
        },
        {
          metric: "Total Expenses",
          value: totalExpenses,
          period: dateRange,
        },
        {
          metric: "Net Balance",
          value: balance,
          period: dateRange,
        },
        {
          metric: "Transaction Count",
          value: filteredTransactions.length,
          period: dateRange,
        },
        ...Object.entries(expensesByCategory).map(([category, amount]) => ({
          metric: `Expenses - ${category}`,
          value: amount,
          period: dateRange,
        })),
      ]
      filename = `financial_summary_${dateRange}_${timestamp}.${exportFormat}`
    }

    if (data.length === 0) {
      alert("No data to export for the selected criteria.")
      return
    }

    if (exportFormat === "csv") {
      exportToCSV(data, filename)
    } else {
      exportToJSON(data, filename)
    }
  }

  const getDataCount = () => {
    if (dataType === "transactions") {
      return filterTransactionsByDate(transactions).length
    } else if (dataType === "goals") {
      return goals.length
    } else {
      return 1 // summary is always 1 report
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
        <CardDescription>Download your financial data in various formats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Type</label>
            <Select value={dataType} onValueChange={setDataType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transactions">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Transactions
                  </div>
                </SelectItem>
                <SelectItem value="goals">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Goals
                  </div>
                </SelectItem>
                <SelectItem value="summary">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Financial Summary
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dataType === "transactions" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
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
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Excel)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Ready to export <strong>{getDataCount()}</strong> {dataType === "summary" ? "report" : "records"}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {exportFormat.toUpperCase()}
          </Badge>
        </div>

        <Button onClick={handleExport} className="w-full" disabled={getDataCount() === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export {dataType === "summary" ? "Report" : "Data"}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• CSV files can be opened in Excel, Google Sheets, or any spreadsheet application</p>
          <p>• JSON files are useful for importing into other applications or backup purposes</p>
          <p>• Financial summaries include totals, balances, and category breakdowns</p>
        </div>
      </CardContent>
    </Card>
  )
}
