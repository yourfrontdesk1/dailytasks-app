import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

async function getUserId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export async function GET(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const date = req.nextUrl.searchParams.get('date') || new Date().toISOString().split('T')[0]
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const meetings = await prisma.meeting.findMany({
    where: { userId, date: { gte: startOfDay, lte: endOfDay } },
    orderBy: { time: 'asc' },
  })

  const tasks = await prisma.task.findMany({
    where: { userId, dueDate: { gte: startOfDay, lte: endOfDay } },
  })

  return NextResponse.json({ meetings, tasks })
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const meeting = await prisma.meeting.create({
    data: {
      title: body.title,
      date: new Date(body.date),
      time: body.time,
      duration: body.duration || null,
      location: body.location || null,
      notes: body.notes || null,
      userId,
    },
  })

  return NextResponse.json(meeting)
}
