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

  const drafts = await prisma.emailDraft.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(drafts)
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const draft = await prisma.emailDraft.create({
    data: {
      to: body.to,
      subject: body.subject,
      body: body.body,
      pipelineItemId: body.pipelineItemId || null,
      userId,
    },
  })

  return NextResponse.json(draft)
}
