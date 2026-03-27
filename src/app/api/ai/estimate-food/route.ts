import { NextRequest, NextResponse } from 'next/server'
import { estimateFoodFromImage } from '@/lib/ai'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  if (body.image && body.mimeType) {
    // Photo analysis
    try {
      const result = await estimateFoodFromImage(body.image, body.mimeType)

      // Save each food item as a nutrition entry
      if (result.foods) {
        for (const food of result.foods) {
          await prisma.nutritionEntry.create({
            data: {
              meal: body.meal || 'snack',
              food: food.name,
              calories: food.calories,
              protein: food.protein || null,
              carbs: food.carbs || null,
              fat: food.fat || null,
              isAiEstimate: true,
              userId: user.id,
            },
          })

          // Update food history
          const normalizedFood = food.name.toLowerCase().trim()
          await prisma.foodHistoryItem.upsert({
            where: { userId_food: { userId: user.id, food: normalizedFood } },
            update: { useCount: { increment: 1 }, calories: food.calories },
            create: {
              food: normalizedFood,
              label: food.name,
              calories: food.calories,
              protein: food.protein || null,
              carbs: food.carbs || null,
              fat: food.fat || null,
              userId: user.id,
            },
          })
        }
      }

      return NextResponse.json(result)
    } catch (error) {
      return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Image required' }, { status: 400 })
}
