import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { parseWorkout } from '@/lib/ai'

async function getUserId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)

  const todayEntry = await prisma.fitnessEntry.findFirst({
    where: { userId, date: { gte: today, lte: endOfDay } },
  })

  // This week
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1)
  const entries = await prisma.fitnessEntry.findMany({
    where: { userId, date: { gte: startOfWeek } },
    orderBy: { date: 'desc' },
  })

  const weekCompleted = entries.filter(e => e.completed).length
  const user = await prisma.user.findUnique({ where: { id: userId } })

  return NextResponse.json({
    todayEntry,
    entries,
    weekCompleted,
    weekTarget: user?.fitnessGoalDays || 4,
  })
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  let parsedData = null

  if (body.description && body.useAi) {
    try {
      parsedData = await parseWorkout(body.description)
    } catch {}
  }

  const entry = await prisma.fitnessEntry.create({
    data: {
      completed: body.completed !== false,
      type: body.type || null,
      description: body.description || null,
      parsedData: parsedData || null,
      duration: body.duration || null,
      userId,
    },
  })

  return NextResponse.json(entry)
}
