import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { calculateDailyScore } from '@/lib/score'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)

  const scoreData = await calculateDailyScore({ userId: user.id, date: today })
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })

  // Get completed and missed items for review
  const tasks = await prisma.task.findMany({
    where: { userId: user.id, dueDate: { gte: today, lte: endOfDay } },
  })

  const completed = tasks.filter(t => t.completed).map(t => ({
    id: t.id,
    title: t.title,
    type: 'task' as const,
    completed: true,
  }))

  const missed = tasks.filter(t => !t.completed).map(t => ({
    id: t.id,
    title: t.title,
    type: 'task' as const,
    completed: false,
  }))

  return NextResponse.json({
    ...scoreData,
    streak: dbUser?.currentStreak || 0,
    completed,
    missed,
  })
}
