import { NextRequest, NextResponse } from 'next/server'
import { draftEmail } from '@/lib/ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  try {
    const result = await draftEmail({
      to: body.to,
      context: body.context,
      tone: body.tone,
      voiceRules: body.voiceRules,
      contactInfo: body.contactInfo,
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'AI draft failed' }, { status: 500 })
  }
}
