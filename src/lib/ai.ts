import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

function getClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return client
}

export async function estimateFood(food: string) {
  const anthropic = getClient()

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Estimate the nutritional content of this food: "${food}"

Return JSON only, no other text:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "confidence": "high" | "medium" | "low"
}

Be conservative. Round calories to nearest 5, macros to nearest 1.
"high" for common whole foods, "medium" for restaurant meals, "low" for vague descriptions.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return JSON.parse(text)
}

export async function estimateFoodFromImage(imageBase64: string, mimeType: string) {
  const anthropic = getClient()

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: `Analyze this food photo. Identify every food item visible.
Use the plate as a reference for portion sizing if visible.
Flag any hidden calories (oils, sauces, butter).

Return JSON only, no other text:
{
  "foods": [
    {
      "name": "string",
      "portion": "string (e.g. '200g', '1 cup')",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  ],
  "total": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number
  },
  "confidence": "high" | "medium" | "low",
  "notes": "string (cooking method observations, hidden calories)"
}

Be conservative. Round calories to nearest 5, macros to nearest 1.`,
          },
        ],
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return JSON.parse(text)
}

export async function parseWorkout(description: string) {
  const anthropic = getClient()

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Parse this workout description into structured data: "${description}"

Return JSON only:
{
  "type": "weights" | "cardio" | "other",
  "exercises": [
    { "name": "string", "sets": number|null, "reps": number|null, "weight": number|null, "duration": number|null }
  ],
  "estimatedDuration": number (minutes)
}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return JSON.parse(text)
}

export async function draftEmail(params: {
  to: string
  context: string
  tone?: string
  voiceRules?: string
  contactInfo?: string
}) {
  const anthropic = getClient()

  const systemPrompt = `You are an email drafting assistant.
${params.voiceRules ? `Writing style rules: ${params.voiceRules}` : ''}
${params.tone ? `Tone: ${params.tone}` : 'Tone: professional but friendly'}
Keep emails concise (under 150 words unless the context requires more).
Never use dashes (em dashes, en dashes) in any text.
Never start with "I hope this email finds you well."
Generate a subject line and body.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Draft an email to: ${params.to}
${params.contactInfo ? `Contact context: ${params.contactInfo}` : ''}
Purpose: ${params.context}

Return JSON only:
{
  "subject": "string",
  "body": "string"
}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return JSON.parse(text)
}
