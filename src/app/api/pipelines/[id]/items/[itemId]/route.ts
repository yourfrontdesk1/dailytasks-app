import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string; itemId: string } }) {
  const body = await req.json()

  const updated = await prisma.pipelineItem.update({
    where: { id: params.itemId },
    data: body,
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; itemId: string } }) {
  await prisma.pipelineItem.delete({ where: { id: params.itemId } })
  return NextResponse.json({ ok: true })
}
