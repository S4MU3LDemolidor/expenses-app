"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import type { Transaction } from "@/app/page"

interface AddExpenseFormProps {
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void
}

const expenseCategories = [
  "Alimentação",
  "Transporte",
  "Compras",
  "Entretenimento",
  "Contas e Utilidades",
  "Saúde",
  "Educação",
  "Viagem",
  "Casa e Jardim",
  "Cuidados Pessoais",
  "Presentes e Doações",
  "Outros",
]

const commonTags = ["Essencial", "Não essencial", "Recorrente", "Único", "Emergência"]

export function AddExpenseForm({ onAddTransaction }: AddExpenseFormProps) {
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!category || !amount) return

    onAddTransaction({
      type: "expense",
      category,
      description,
      amount: Number.parseFloat(amount),
      date,
      tags,
    })

    // Reset form
    setCategory("")
    setDescription("")
    setAmount("")
    setDate(new Date().toISOString().split("T")[0])
    setTags([])
    setCustomTag("")
  }

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const addCustomTag = () => {
    if (customTag.trim()) {
      addTag(customTag.trim())
      setCustomTag("")
    }
  }

  return (
    <Card className="max-w-2xl mx-auto px-2 sm:px-0">
      <CardHeader>
        <CardTitle className="text-2xl">Adicionar Despesa</CardTitle>
        <CardDescription>Acompanhe seus gastos para entender onde seu dinheiro está sendo usado</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Em que você gastou?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="space-y-4">
            <Label>Tags (Opcional)</Label>

            {/* Selected Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}

            {/* Common Tags */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tags rápidas:</p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {commonTags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm h-8 px-2 sm:px-3"
                    onClick={() => addTag(tag)}
                    disabled={tags.includes(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2 flex-col sm:flex-row">
              <Input
                placeholder="Adicionar tag personalizada"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
              />
              <Button type="button" onClick={addCustomTag} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!category || !amount}>
            Adicionar Despesa
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
