"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { useState } from "react"
import type { Transaction } from "@/app/page"
import { TrendingUp, AlertTriangle } from "lucide-react"

interface IncomeVsExpenseChartProps {
  transactions: Transaction[]
}

export function IncomeVsExpenseChart({ transactions }: IncomeVsExpenseChartProps) {
  const [timeFilter, setTimeFilter] = useState("month")

  const getChartData = () => {
    const now = new Date()
    const periods: string[] = []
    let periodFormat: (date: Date) => string

    switch (timeFilter) {
      case "week":
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          periods.push(date.toISOString().split("T")[0])
        }
        periodFormat = (date: Date) => date.toISOString().split("T")[0]
        break
      case "month":
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          periods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`)
        }
        periodFormat = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        break
      case "year":
        // Last 5 years
        for (let i = 4; i >= 0; i--) {
          periods.push(String(now.getFullYear() - i))
        }
        periodFormat = (date: Date) => String(date.getFullYear())
        break
      default:
        return []
    }

    return periods.map((period) => {
      const periodTransactions = transactions.filter((t) => {
        const transactionPeriod = periodFormat(new Date(t.date))
        return transactionPeriod === period
      })

      const income = periodTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

      const expenses = periodTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

      return {
        period:
          timeFilter === "week"
            ? new Date(period).toLocaleDateString("pt-BR", { month: "short", day: "numeric" })
            : timeFilter === "month"
              ? new Date(period + "-01").toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
              : period,
        income,
        expenses,
        net: income - expenses,
      }
    })
  }

  const chartData = getChartData()
  const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0)
  const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0)
  const netTotal = totalIncome - totalExpenses
  const isOverspending = netTotal < 0

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              {isOverspending ? (
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              ) : (
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              )}
              Receitas vs Despesas
            </CardTitle>
            <CardDescription className="text-sm">
              {isOverspending ? `Déficit: R$ ${Math.abs(netTotal).toFixed(2)}` : `Superávit: R$ ${netTotal.toFixed(2)}`}
            </CardDescription>
          </div>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-24 sm:w-32 text-xs sm:text-sm self-start sm:self-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semanal</SelectItem>
              <SelectItem value="month">Mensal</SelectItem>
              <SelectItem value="year">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 12 }}
                  angle={timeFilter === "week" ? -45 : 0}
                  textAnchor={timeFilter === "week" ? "end" : "middle"}
                  height={timeFilter === "week" ? 80 : 60}
                />
                <YAxis />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" name="Receitas" />
                <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhum dado disponível para o período selecionado
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="text-center">
            <div className="font-medium text-green-600">Total de Receitas</div>
            <div className="text-lg font-bold">R$ {totalIncome.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-red-600">Total de Despesas</div>
            <div className="text-lg font-bold">R$ {totalExpenses.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Saldo</div>
            <div className={`text-lg font-bold ${netTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {netTotal.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
