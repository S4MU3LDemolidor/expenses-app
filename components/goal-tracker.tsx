"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Target, Plus, Calendar, DollarSign, TrendingUp } from "lucide-react"
import type { Goal } from "@/app/page"

interface GoalTrackerProps {
  goals: Goal[]
  onAddGoal: (goal: Omit<Goal, "id">) => void
  onUpdateGoal: (goalId: string, currentAmount: number) => void
  currentBalance: number
}

export function GoalTracker({ goals, onAddGoal, onUpdateGoal, currentBalance }: GoalTrackerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [deadline, setDeadline] = useState("")
  const [updateAmount, setUpdateAmount] = useState("")
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !targetAmount || !deadline) return

    onAddGoal({
      title,
      targetAmount: Number.parseFloat(targetAmount),
      currentAmount: 0,
      deadline,
    })

    // Reset form
    setTitle("")
    setTargetAmount("")
    setDeadline("")
    setIsDialogOpen(false)
  }

  const handleUpdateGoal = (goalId: string) => {
    if (!updateAmount) return

    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return

    const newAmount = Math.min(goal.targetAmount, Math.max(0, Number.parseFloat(updateAmount)))
    onUpdateGoal(goalId, newAmount)
    setUpdateAmount("")
    setSelectedGoalId(null)
  }

  const getGoalStatus = (goal: Goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100
    const deadline = new Date(goal.deadline)
    const now = new Date()
    const isOverdue = deadline < now && progress < 100

    if (progress >= 100) return { status: "completed", color: "default" }
    if (isOverdue) return { status: "overdue", color: "destructive" }
    if (progress >= 75) return { status: "almost there", color: "default" }
    if (progress >= 50) return { status: "on track", color: "secondary" }
    return { status: "just started", color: "outline" }
  }

  const getDaysRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Goal Tracker</h2>
          <p className="text-sm text-muted-foreground">Set and track your financial goals</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="self-start sm:self-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
              <DialogDescription>Set a financial goal to work towards</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Goal Title</Label>
                <Input
                  id="goal-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-amount">Target Amount ($)</Label>
                <Input
                  id="target-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="1000.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Target Date</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Create Goal
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by setting your first financial goal to track your progress
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100
            const daysRemaining = getDaysRemaining(goal.deadline)
            const goalStatus = getGoalStatus(goal)
            const canAfford = currentBalance >= goal.targetAmount - goal.currentAmount

            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate">{goal.title}</CardTitle>
                      <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-xs sm:text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          {daysRemaining > 0
                            ? `${daysRemaining} days left`
                            : daysRemaining === 0
                              ? "Due today"
                              : `${Math.abs(daysRemaining)} days overdue`}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant={goalStatus.color as any} className="self-start text-xs">
                      {goalStatus.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${goal.currentAmount.toFixed(2)}</span>
                      <span>${goal.targetAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4" />
                      <span>Remaining: ${(goal.targetAmount - goal.currentAmount).toFixed(2)}</span>
                    </div>
                    {canAfford && goal.currentAmount < goal.targetAmount && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>You can complete this goal with your current balance!</span>
                      </div>
                    )}
                  </div>

                  {goal.currentAmount < goal.targetAmount && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={goal.targetAmount - goal.currentAmount}
                        placeholder="Add amount"
                        value={selectedGoalId === goal.id ? updateAmount : ""}
                        onChange={(e) => {
                          setUpdateAmount(e.target.value)
                          setSelectedGoalId(goal.id)
                        }}
                        className="text-sm"
                      />
                      <Button
                        onClick={() => handleUpdateGoal(goal.id)}
                        disabled={!updateAmount || selectedGoalId !== goal.id}
                        size="sm"
                        className="sm:w-auto w-full"
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
