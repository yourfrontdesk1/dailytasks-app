import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()

  const item = await prisma.pipelineItem.create({
    data: {
      name: body.name,
      stageId: body.stageId,
      contactName: body.contactName || null,
      contactEmail: body.contactEmail || null,
      value: body.value || null,
      nextAction: body.nextAction || null,
      nextActionDate: body.nextActionDate ? new Date(body.nextActionDate) : null,
      pipelineId: params.id,
    },
  })

  return NextResponse.json(item)
}
