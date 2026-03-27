import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

async function getUserId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Ensure user exists in our DB
  let dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: { id: user.id, email: user.email! },
    })
  }
  return user.id
}

export async function GET(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const filter = req.nextUrl.searchParams.get('filter') || 'today'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)

  let where: any = { userId }

  if (filter === 'today') {
    where.dueDate = { gte: today, lte: endOfDay }
  } else if (filter === 'upcoming') {
    where.dueDate = { gt: endOfDay }
    where.completed = false
  } else if (filter === 'completed') {
    where.completed = true
  }

  const tasks = await prisma.task.findMany({
    where,
    include: { category: true },
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(
    tasks.map(t => ({
      ...t,
      categoryColour: t.category?.colour,
      categoryName: t.category?.name,
    }))
  )
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : new Date(),
      dueTime: body.dueTime || null,
      priority: body.priority || 2,
      recurring: body.recurring || null,
      categoryId: body.categoryId || null,
      userId,
    },
  })

  return NextResponse.json(task)
}
