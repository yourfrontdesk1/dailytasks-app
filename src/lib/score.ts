import { prisma } from './db'

interface ScoreInput {
  userId: string
  date: Date
}

export async function calculateDailyScore({ userId, date }: ScoreInput) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return null

  let totalItems = 0
  let completedItems = 0

  // Tasks due today
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      dueDate: { gte: startOfDay, lte: endOfDay },
    },
  })
  totalItems += tasks.length
  completedItems += tasks.filter(t => t.completed).length

  // Nutrition (if enabled): count meals logged
  if (user.moduleNutrition) {
    const nutritionEntries = await prisma.nutritionEntry.findMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    })
    // Expect at least breakfast, lunch, dinner = 3
    const expectedMeals = 3
    totalItems += expectedMeals
    completedItems += Math.min(nutritionEntries.length, expectedMeals)
  }

  // Fitness (if enabled): did they work out?
  if (user.moduleFitness) {
    const fitnessEntry = await prisma.fitnessEntry.findFirst({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    })

    // Check if today is a scheduled workout day
    const dayOfWeek = date.getDay()
    const fitnessGoalDays = user.fitnessGoalDays || 0
    const workingDays = user.workingDays.length
    // Simple: if goal is 4 days/week and there are 5 working days, schedule first 4
    if (fitnessGoalDays > 0 && dayOfWeek >= 1 && dayOfWeek <= fitnessGoalDays) {
      totalItems += 1
      if (fitnessEntry?.completed) completedItems += 1
    }
  }

  // Pipeline actions due today
  if (user.modulePipelines) {
    const pipelineActions = await prisma.pipelineItem.findMany({
      where: {
        pipeline: { userId },
        nextActionDate: { gte: startOfDay, lte: endOfDay },
      },
    })
    totalItems += pipelineActions.length
    // Pipeline actions are "completed" if nextActionDate has been pushed forward
    // For now, count them as incomplete (user must reschedule or complete)
  }

  // Meetings
  if (user.moduleCalendar) {
    const meetings = await prisma.meeting.findMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    })
    totalItems += meetings.length
    // Meetings auto-complete (if time has passed)
    const now = new Date()
    completedItems += meetings.filter(m => {
      const meetingTime = new Date(m.date)
      return meetingTime < now
    }).length
  }

  const score = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return { totalItems, completedItems, score }
}

export async function updateStreak(userId: string, score: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return

  const threshold = user.streakThreshold

  if (score >= threshold) {
    const newStreak = user.currentStreak + 1
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, user.longestStreak),
        lastReviewDate: new Date(),
      },
    })
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: 0,
        lastReviewDate: new Date(),
      },
    })
  }
}
