"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Quote, Trash2, Edit, Save, X, AlertCircle } from "lucide-react"

export interface CustomQuote {
  id: string
  text: string
  author: string
  dateAdded: string
}

interface CustomQuotesManagerProps {
  customQuotes: CustomQuote[]
  onAddQuote: (quote: Omit<CustomQuote, "id">) => void
  onUpdateQuote: (id: string, quote: Omit<CustomQuote, "id" | "dateAdded">) => void
  onDeleteQuote: (id: string) => void
}

export function CustomQuotesManager({
  customQuotes,
  onAddQuote,
  onUpdateQuote,
  onDeleteQuote,
}: CustomQuotesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [quoteText, setQuoteText] = useState("")
  const [author, setAuthor] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [editAuthor, setEditAuthor] = useState("")

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault()

    if (!quoteText.trim()) return

    onAddQuote({
      text: quoteText.trim(),
      author: author.trim() || "Unknown",
      dateAdded: new Date().toISOString(),
    })

    // Reset form
    setQuoteText("")
    setAuthor("")
    setIsDialogOpen(false)
  }

  const handleEditStart = (quote: CustomQuote) => {
    setEditingId(quote.id)
    setEditText(quote.text)
    setEditAuthor(quote.author)
  }

  const handleEditSave = (id: string) => {
    if (!editText.trim()) return

    onUpdateQuote(id, {
      text: editText.trim(),
      author: editAuthor.trim() || "Unknown",
    })

    setEditingId(null)
    setEditText("")
    setEditAuthor("")
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditText("")
    setEditAuthor("")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Custom Quotes</h2>
          <p className="text-sm text-muted-foreground">Add your own motivational quotes to the weekly rotation</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="self-start sm:self-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Quote
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Quote</DialogTitle>
              <DialogDescription>Add a motivational quote that inspires your financial journey</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddQuote} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="quote-text" className="text-sm font-medium">
                  Quote Text *
                </label>
                <Textarea
                  id="quote-text"
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  placeholder="Enter your motivational quote..."
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="author" className="text-sm font-medium">
                  Author (Optional)
                </label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Quote author or source"
                />
              </div>
              <Button type="submit" className="w-full" disabled={!quoteText.trim()}>
                Add Quote
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {customQuotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Quote className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Custom Quotes Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your own motivational quotes to personalize your weekly inspiration
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Quote
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Custom quotes are mixed with default quotes in the weekly rotation. You have{" "}
              <strong>{customQuotes.length}</strong> custom quote{customQuotes.length !== 1 ? "s" : ""} that will appear
              in your weekly motivation.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {customQuotes.map((quote) => (
              <Card key={quote.id}>
                <CardContent className="pt-6">
                  {editingId === quote.id ? (
                    <div className="space-y-4">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <Input value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} placeholder="Author" />
                      <div className="flex gap-2">
                        <Button onClick={() => handleEditSave(quote.id)} size="sm" disabled={!editText.trim()}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={handleEditCancel} variant="outline" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <blockquote className="text-lg italic border-l-4 border-primary pl-4">"{quote.text}"</blockquote>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">— {quote.author}</span>
                          <Badge variant="outline" className="text-xs">
                            Added {formatDate(quote.dateAdded)}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditStart(quote)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => onDeleteQuote(quote.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
