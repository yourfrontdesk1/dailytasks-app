import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const updated = await prisma.task.update({
    where: { id: params.id },
    data: { dueDate: tomorrow },
  })

  return NextResponse.json(updated)
}
