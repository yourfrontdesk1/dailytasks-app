import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Upsert user with onboarding data
  await prisma.user.upsert({
    where: { id: user.id },
    update: {
      name: body.name,
      role: body.role,
      dayStartTime: body.dayStartTime,
      dayEndTime: body.dayEndTime,
      workingDays: body.workingDays,
      theme: body.theme,
      moduleTasks: body.moduleTasks,
      modulePipelines: body.modulePipelines,
      moduleCalendar: body.moduleCalendar,
      moduleEmailDrafts: body.moduleEmailDrafts,
      moduleNutrition: body.moduleNutrition,
      moduleFitness: body.moduleFitness,
      calorieTarget: body.calorieTarget || null,
      trackMacros: body.trackMacros,
      proteinTarget: body.proteinTarget || null,
      carbsTarget: body.carbsTarget || null,
      fatTarget: body.fatTarget || null,
      fitnessGoalDays: body.fitnessGoalDays || null,
      fitnessType: body.fitnessType || null,
      nudgeLevel: body.nudgeLevel,
      onboardingComplete: true,
    },
    create: {
      id: user.id,
      email: user.email!,
      name: body.name,
      role: body.role,
      dayStartTime: body.dayStartTime,
      dayEndTime: body.dayEndTime,
      workingDays: body.workingDays,
      theme: body.theme,
      moduleTasks: body.moduleTasks,
      modulePipelines: body.modulePipelines,
      moduleCalendar: body.moduleCalendar,
      moduleEmailDrafts: body.moduleEmailDrafts,
      moduleNutrition: body.moduleNutrition,
      moduleFitness: body.moduleFitness,
      calorieTarget: body.calorieTarget || null,
      trackMacros: body.trackMacros,
      proteinTarget: body.proteinTarget || null,
      carbsTarget: body.carbsTarget || null,
      fatTarget: body.fatTarget || null,
      fitnessGoalDays: body.fitnessGoalDays || null,
      fitnessType: body.fitnessType || null,
      nudgeLevel: body.nudgeLevel,
      onboardingComplete: true,
    },
  })

  // Create categories
  if (body.categories?.length) {
    for (const cat of body.categories) {
      if (cat.name.trim()) {
        await prisma.category.create({
          data: { name: cat.name, colour: cat.colour, userId: user.id },
        })
      }
    }
  }

  return NextResponse.json({ ok: true })
}
