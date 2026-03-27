import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const task = await prisma.task.findUnique({ where: { id: params.id } })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.task.update({
    where: { id: params.id },
    data: {
      completed: !task.completed,
      completedAt: !task.completed ? new Date() : null,
    },
  })

  return NextResponse.json(updated)
}
