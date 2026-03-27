import { NextRequest, NextResponse } from 'next/server'
import { parseWorkout } from '@/lib/ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  try {
    const result = await parseWorkout(body.description)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'AI parsing failed' }, { status: 500 })
  }
}
