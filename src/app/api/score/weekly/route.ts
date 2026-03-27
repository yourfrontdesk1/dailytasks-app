import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Last 7 days
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - 6)

  const dailyScores = await prisma.dailyScore.findMany({
    where: { userId: user.id, date: { gte: startOfWeek, lte: today } },
    orderBy: { date: 'asc' },
  })

  // Fill in missing days
  const scoreMap = new Map(dailyScores.map(s => [s.date.toISOString().split('T')[0], s]))
  const weekData = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayName = d.toLocaleDateString('en-GB', { weekday: 'short' })
    const existing = scoreMap.get(dateStr)
    weekData.push({
      date: dateStr,
      day: dayName,
      score: existing?.score || 0,
    })
  }

  const scores = weekData.map(d => d.score).filter(s => s > 0)
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

  // Tasks stats
  const weekTasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      dueDate: { gte: startOfWeek, lte: today },
    },
  })
  const tasksCompleted = weekTasks.filter(t => t.completed).length
  const tasksPlanned = weekTasks.length

  // Nutrition stats
  const weekNutrition = await prisma.nutritionEntry.findMany({
    where: { userId: user.id, date: { gte: startOfWeek, lte: today } },
  })
  const nutritionByDay = new Map<string, number>()
  weekNutrition.forEach(e => {
    const d = e.date.toISOString().split('T')[0]
    nutritionByDay.set(d, (nutritionByDay.get(d) || 0) + e.calories)
  })
  const calorieTarget = dbUser.calorieTarget || 2000
  let nutritionDaysHit = 0
  let totalCals = 0
  let daysWithEntries = 0
  nutritionByDay.forEach((cals) => {
    daysWithEntries++
    totalCals += cals
    if (cals >= calorieTarget * 0.8 && cals <= calorieTarget * 1.2) {
      nutritionDaysHit++
    }
  })
  const averageCalories = daysWithEntries > 0 ? Math.round(totalCals / daysWithEntries) : 0

  // Fitness stats
  const weekFitness = await prisma.fitnessEntry.findMany({
    where: { userId: user.id, date: { gte: startOfWeek }, completed: true },
  })
  const fitnessCompleted = weekFitness.length
  const fitnessTarget = dbUser.fitnessGoalDays || 4

  // Pipeline stats
  let pipelinesClosed = 0
  let pipelinesOverdue = 0
  if (dbUser.modulePipelines) {
    const overdueItems = await prisma.pipelineItem.findMany({
      where: {
        pipeline: { userId: user.id },
        nextActionDate: { lt: today },
        nextAction: { not: null },
      },
    })
    pipelinesOverdue = overdueItems.length
  }

  // Pattern detection
  const patterns: string[] = []

  // Find consistently missed days
  const dayScores: Record<string, number[]> = {}
  weekData.forEach(d => {
    if (!dayScores[d.day]) dayScores[d.day] = []
    dayScores[d.day].push(d.score)
  })

  // Find best/worst days
  let bestDay = weekData[0]
  let worstDay = weekData[0]
  weekData.forEach(d => {
    if (d.score > bestDay.score) bestDay = d
    if (d.score < worstDay.score && d.score > 0) worstDay = d
  })
  if (bestDay.score > 0) {
    patterns.push(`✓ Your best day was ${bestDay.day} (${bestDay.score}%)`)
  }
  if (worstDay.score > 0 && worstDay.date !== bestDay.date) {
    patterns.push(`⚠️ Lowest score was ${worstDay.day} (${worstDay.score}%)`)
  }

  // Fitness pattern
  if (dbUser.moduleFitness && fitnessCompleted < fitnessTarget) {
    patterns.push(`⚠️ Only ${fitnessCompleted}/${fitnessTarget} workouts this week`)
  }

  // Nutrition pattern
  if (dbUser.moduleNutrition && daysWithEntries < 5) {
    patterns.push(`⚠️ You only logged meals on ${daysWithEntries} days`)
  }

  if (averageScore >= 80) {
    patterns.push(`✓ Great week! Average score above 80%`)
  }

  return NextResponse.json({
    averageScore,
    streak: dbUser.currentStreak,
    tasksCompleted,
    tasksPlanned,
    nutritionDaysHit,
    averageCalories,
    fitnessCompleted,
    fitnessTarget,
    pipelinesClosed,
    pipelinesOverdue,
    patterns,
    dailyScores: weekData,
  })
}
