import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { estimateFood } from '@/lib/ai'

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

  const entries = await prisma.nutritionEntry.findMany({
    where: { userId, date: { gte: startOfDay, lte: endOfDay } },
    orderBy: { createdAt: 'asc' },
  })

  const user = await prisma.user.findUnique({ where: { id: userId } })

  return NextResponse.json({
    entries,
    calorieTarget: user?.calorieTarget || 2000,
  })
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  let calories = body.calories
  let protein = body.protein
  let carbs = body.carbs
  let fat = body.fat
  let isAiEstimate = false

  // AI estimation if no calories provided
  if (!calories && body.food && body.useAi) {
    try {
      const estimate = await estimateFood(body.food)
      calories = estimate.calories
      protein = estimate.protein
      carbs = estimate.carbs
      fat = estimate.fat
      isAiEstimate = true
    } catch {
      return NextResponse.json({ error: 'AI estimation failed' }, { status: 500 })
    }
  }

  if (!calories) {
    return NextResponse.json({ error: 'Calories required' }, { status: 400 })
  }

  const entry = await prisma.nutritionEntry.create({
    data: {
      meal: body.meal || 'snack',
      food: body.food,
      calories,
      protein: protein || null,
      carbs: carbs || null,
      fat: fat || null,
      isAiEstimate,
      userId,
    },
  })

  // Update food history
  const normalizedFood = body.food.toLowerCase().trim()
  await prisma.foodHistoryItem.upsert({
    where: { userId_food: { userId, food: normalizedFood } },
    update: { useCount: { increment: 1 }, calories, protein, carbs, fat },
    create: {
      food: normalizedFood,
      label: body.food,
      calories,
      protein: protein || null,
      carbs: carbs || null,
      fat: fat || null,
      userId,
    },
  })

  return NextResponse.json(entry)
}
