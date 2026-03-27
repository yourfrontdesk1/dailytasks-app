import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { calculateDailyScore } from '@/lib/score'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)

  // Today's tasks
  const allTasks = await prisma.task.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
  })

  const todayTasks = allTasks
    .filter(t => t.dueDate && t.dueDate >= today && t.dueDate <= endOfDay)
    .map(t => ({
      id: t.id,
      title: t.title,
      completed: t.completed,
      priority: t.priority,
      dueTime: t.dueTime,
      categoryColour: t.category?.colour,
    }))

  // Overdue tasks
  const overdue = allTasks
    .filter(t => t.dueDate && t.dueDate < today && !t.completed)
    .map(t => {
      const daysOverdue = Math.ceil((today.getTime() - t.dueDate!.getTime()) / (1000 * 60 * 60 * 24))
      return {
        id: t.id,
        title: t.title,
        completed: false,
        priority: t.priority,
        dueTime: t.dueTime,
        overdueDays: daysOverdue,
      }
    })

  // Meetings
  let meetings: any[] = []
  if (dbUser.moduleCalendar) {
    meetings = await prisma.meeting.findMany({
      where: { userId: user.id, date: { gte: today, lte: endOfDay } },
      orderBy: { time: 'asc' },
    })
  }

  // Pipeline actions due today
  let pipelineActions: any[] = []
  if (dbUser.modulePipelines) {
    const items = await prisma.pipelineItem.findMany({
      where: {
        pipeline: { userId: user.id },
        nextActionDate: { lte: endOfDay },
        nextAction: { not: null },
      },
      include: { pipeline: true },
    })
    pipelineActions = items.map(i => ({
      id: i.id,
      name: i.name,
      pipelineName: i.pipeline.name,
      nextAction: i.nextAction,
      overdueDays: i.nextActionDate
        ? Math.max(0, Math.ceil((today.getTime() - i.nextActionDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 0,
    }))
  }

  // Nutrition summary
  let nutrition = null
  if (dbUser.moduleNutrition) {
    const entries = await prisma.nutritionEntry.findMany({
      where: { userId: user.id, date: { gte: today, lte: endOfDay } },
    })
    nutrition = {
      caloriesConsumed: entries.reduce((s, e) => s + e.calories, 0),
      calorieTarget: dbUser.calorieTarget || 2000,
      protein: entries.reduce((s, e) => s + (e.protein || 0), 0),
      carbs: entries.reduce((s, e) => s + (e.carbs || 0), 0),
      fat: entries.reduce((s, e) => s + (e.fat || 0), 0),
      mealsLogged: entries.length,
    }
  }

  // Fitness summary
  let fitness = null
  if (dbUser.moduleFitness) {
    const todayEntry = await prisma.fitnessEntry.findFirst({
      where: { userId: user.id, date: { gte: today, lte: endOfDay } },
    })
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1)
    const weekEntries = await prisma.fitnessEntry.findMany({
      where: { userId: user.id, date: { gte: startOfWeek }, completed: true },
    })
    fitness = {
      loggedToday: !!todayEntry,
      weekCompleted: weekEntries.length,
      weekTarget: dbUser.fitnessGoalDays || 4,
    }
  }

  // Score
  const scoreData = await calculateDailyScore({ userId: user.id, date: today })

  // Check if review is gated
  const lastReview = dbUser.lastReviewDate
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const reviewGated = lastReview ? lastReview < yesterday : false

  return NextResponse.json({
    tasks: todayTasks,
    overdue,
    meetings,
    pipelineActions,
    nutrition,
    fitness,
    score: scoreData?.score || 0,
    streak: dbUser.currentStreak,
    reviewGated,
    modules: {
      tasks: dbUser.moduleTasks,
      pipelines: dbUser.modulePipelines,
      calendar: dbUser.moduleCalendar,
      emailDrafts: dbUser.moduleEmailDrafts,
      nutrition: dbUser.moduleNutrition,
      fitness: dbUser.moduleFitness,
    },
  })
}
