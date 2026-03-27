import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const history = await prisma.foodHistoryItem.findMany({
    where: { userId: user.id },
    orderBy: [{ isFavourite: 'desc' }, { useCount: 'desc' }],
    take: 20,
  })

  return NextResponse.json(history)
}
