import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const pipeline = await prisma.pipeline.findUnique({
    where: { id: params.id },
    include: { items: { orderBy: { createdAt: 'asc' } } },
  })

  if (!pipeline) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(pipeline)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.pipeline.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
