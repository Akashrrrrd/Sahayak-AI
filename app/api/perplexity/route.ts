import { type NextRequest, NextResponse } from "next/server"

const PERPLEXITY_API_KEY = "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"

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt } = await request.json()

    // Combine system prompt with user message
    const combinedMessages = [
      {
        role: "system",
        content:
          systemPrompt ||
          "You are Sahayak AI, a helpful teaching assistant for Indian classrooms serving students from Grade 1-12. Provide educational content that is culturally relevant and suitable for students. Adjust complexity based on grade level - simple for primary (1-5), moderate for middle school (6-8), and advanced for high school (9-12). **Format your responses using Markdown for clear readability (e.g., bold, lists, headings).** Include preparation for board exams (CBSE/State boards) and competitive exams (JEE/NEET) for higher grades.",
      },
      ...messages,
    ]

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: combinedMessages,
        max_tokens: 1000,
        temperature: 0.2,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_mode: "web",
        reasoning_effort: "medium",
        top_k: 0,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 0,
        web_search_options: {
          search_context_size: "low",
        },
      }),
    })

    const responseText = await response.text()
    console.log("Perplexity API Response:", responseText)

    if (!response.ok) {
      console.error("Perplexity API Error:", response.status, responseText)

      // Try with the basic sonar model if sonar-pro fails
      const fallbackResponse = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: combinedMessages,
          max_tokens: 1000,
          temperature: 0.2,
          top_p: 0.9,
          return_images: false,
          return_related_questions: false,
          search_mode: "web",
          reasoning_effort: "medium",
          top_k: 0,
          stream: false,
          presence_penalty: 0,
          frequency_penalty: 0,
          web_search_options: {
            search_context_size: "low",
          },
        }),
      })

      if (!fallbackResponse.ok) {
        const fallbackText = await fallbackResponse.text()
        console.error("Fallback API Error:", fallbackResponse.status, fallbackText)
        throw new Error(`API error: ${response.status} - ${responseText}`)
      }

      const fallbackData = await fallbackResponse.json()
      return NextResponse.json({ content: fallbackData.choices[0].message.content })
    }

    const data = JSON.parse(responseText)
    return NextResponse.json({ content: data.choices[0].message.content })
  } catch (error) {
    console.error("Perplexity API Error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate content. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
