import { prisma } from './db'

export async function generateRecurringTasks(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)

  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon...
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5

  // Find all recurring tasks for this user
  const recurringTasks = await prisma.task.findMany({
    where: {
      userId,
      recurring: { not: null },
    },
    distinct: ['title', 'recurring'],
  })

  for (const template of recurringTasks) {
    let shouldCreate = false

    switch (template.recurring) {
      case 'daily':
        shouldCreate = true
        break
      case 'weekdays':
        shouldCreate = isWeekday
        break
      case 'weekly': {
        // Create on the same day of week as the original
        const originalDay = template.dueDate ? template.dueDate.getDay() : 1
        shouldCreate = dayOfWeek === originalDay
        break
      }
      case 'monthly': {
        // Create on the same day of month
        const originalDate = template.dueDate ? template.dueDate.getDate() : 1
        shouldCreate = today.getDate() === originalDate
        break
      }
    }

    if (shouldCreate) {
      // Check if already created for today
      const existing = await prisma.task.findFirst({
        where: {
          userId,
          title: template.title,
          recurring: template.recurring,
          dueDate: { gte: today, lte: endOfDay },
        },
      })

      if (!existing) {
        await prisma.task.create({
          data: {
            title: template.title,
            description: template.description,
            dueDate: today,
            dueTime: template.dueTime,
            priority: template.priority,
            recurring: template.recurring,
            categoryId: template.categoryId,
            userId,
          },
        })
      }
    }
  }
}
