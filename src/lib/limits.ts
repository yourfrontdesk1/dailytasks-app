import { prisma } from './db'

export const FREE_LIMITS = {
  maxTasks: 50,
  maxPipelines: 1,
  maxPipelineStages: 3,
  maxNudgesPerDay: 1,
  aiFeatures: false,
  weeklyReport: false,
  patternInsights: false,
}

export const PRO_LIMITS = {
  maxTasks: Infinity,
  maxPipelines: Infinity,
  maxPipelineStages: Infinity,
  maxNudgesPerDay: 3,
  aiFeatures: true,
  weeklyReport: true,
  patternInsights: true,
}

export async function checkLimit(userId: string, feature: string): Promise<{ allowed: boolean; reason?: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { allowed: false, reason: 'User not found' }

  const isPro = user.plan === 'pro'
  const limits = isPro ? PRO_LIMITS : FREE_LIMITS

  switch (feature) {
    case 'create_task': {
      if (isPro) return { allowed: true }
      const count = await prisma.task.count({ where: { userId } })
      if (count >= limits.maxTasks) {
        return { allowed: false, reason: `Free plan is limited to ${FREE_LIMITS.maxTasks} tasks. Upgrade to Pro for unlimited.` }
      }
      return { allowed: true }
    }

    case 'create_pipeline': {
      if (isPro) return { allowed: true }
      const count = await prisma.pipeline.count({ where: { userId } })
      if (count >= limits.maxPipelines) {
        return { allowed: false, reason: `Free plan is limited to ${FREE_LIMITS.maxPipelines} pipeline. Upgrade to Pro for unlimited.` }
      }
      return { allowed: true }
    }

    case 'ai_nutrition':
    case 'ai_fitness':
    case 'ai_email': {
      if (!isPro) {
        return { allowed: false, reason: 'AI features require Pro plan.' }
      }
      return { allowed: true }
    }

    case 'weekly_report': {
      if (!isPro) {
        return { allowed: false, reason: 'Weekly reports require Pro plan.' }
      }
      return { allowed: true }
    }

    default:
      return { allowed: true }
  }
}
