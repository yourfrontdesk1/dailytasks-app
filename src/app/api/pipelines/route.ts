import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

async function getUserId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pipelines = await prisma.pipeline.findMany({
    where: { userId },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(pipelines)
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const pipeline = await prisma.pipeline.create({
    data: {
      name: body.name,
      stages: body.stages,
      userId,
    },
  })

  return NextResponse.json(pipeline)
}
