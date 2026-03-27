import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { calculateDailyScore, updateStreak } from '@/lib/score'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const scoreData = await calculateDailyScore({ userId: user.id, date: today })
  if (!scoreData) return NextResponse.json({ error: 'Could not calculate score' }, { status: 500 })

  // Save daily score
  await prisma.dailyScore.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    update: {
      totalItems: scoreData.totalItems,
      completedItems: scoreData.completedItems,
      score: scoreData.score,
      reviewCompleted: true,
    },
    create: {
      userId: user.id,
      date: today,
      totalItems: scoreData.totalItems,
      completedItems: scoreData.completedItems,
      score: scoreData.score,
      reviewCompleted: true,
    },
  })

  // Update streak
  await updateStreak(user.id, scoreData.score)

  return NextResponse.json({ ok: true, score: scoreData.score })
}
