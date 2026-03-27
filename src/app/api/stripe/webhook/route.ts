import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '')
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any
      const userId = session.metadata?.userId
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: 'pro',
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
          },
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as any
      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      })
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { plan: 'free', stripeSubscriptionId: null },
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as any
      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      })
      if (user) {
        const isActive = ['active', 'trialing'].includes(subscription.status)
        await prisma.user.update({
          where: { id: user.id },
          data: { plan: isActive ? 'pro' : 'free' },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
