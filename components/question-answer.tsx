"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Volume2, Lightbulb, Loader2 } from "lucide-react"
import { marked } from "marked" // Import marked
import DOMPurify from "dompurify" // Import DOMPurify

const sampleQuestions = [
  "Why do stars twinkle?",
  "How do plants make food?",
  "What causes rain?",
  "Why is the sky blue?",
  "How do birds fly?",
  "What makes thunder sound?",
  "Why do we have seasons?",
  "How do magnets work?",
  "What is photosynthesis?",
  "How does the human heart work?",
  "What causes earthquakes?",
  "How do computers process information?",
  "What is the theory of relativity?",
  "How does DNA replication work?",
  "What causes inflation in economics?",
  "How do chemical reactions occur?",
]

export default function QuestionAnswer() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<{ question: string; answer: string }[]>([])

  const generateAnswer = async (inputQuestion: string) => {
    if (!inputQuestion.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/perplexity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Student question: "${inputQuestion}"\n\nProvide a clear, engaging answer with local analogies that Indian students can relate to. Format your response using Markdown.`,
            },
          ],
          systemPrompt:
            "You are Sahayak AI, a friendly teaching assistant for Indian students from Grade 1-12. Answer questions in simple English suitable for the appropriate grade level. For younger students (1-5), use very simple language and local analogies. For middle school (6-8), include more scientific concepts. For high school (9-12), provide detailed explanations suitable for board exams and competitive exams like JEE/NEET. Always include: 1. A clear explanation appropriate for the grade level 2. A relatable analogy from Indian context 3. An engaging example or story 4. Encourage curiosity with a follow-up question. Make your answers culturally relevant to Indian students. Format your responses using Markdown.",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("API Error:", data)
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      const content = data.content || "I couldn't generate an answer. Please try again."
      setAnswer(content)
      setConversationHistory((prev) => [...prev, { question: inputQuestion, answer: content }])
      setQuestion("")
    } catch (error) {
      console.error("Error generating answer:", error)
      const errorMessage = `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`
      setAnswer(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const speakAnswer = () => {
    if ("speechSynthesis" in window && answer) {
      const utterance = new SpeechSynthesisUtterance(answer)
      utterance.lang = "en-IN"
      speechSynthesis.speak(utterance)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generateAnswer(question)
  }

  // Function to render Markdown safely
  const renderMarkdown = (markdown: string) => {
    const html = marked.parse(markdown)
    const sanitizedHtml = DOMPurify.sanitize(html as string)
    return { __html: sanitizedHtml }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Question Input */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <MessageCircle className="h-5 w-5" />
            Ask Any Question
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Get instant answers with local analogies and examples
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask any question about science, math, or general knowledge..."
                className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Button type="submit" disabled={isGenerating || !question.trim()} className="w-full sm:w-auto">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Current Answer */}
      {answer && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="dark:text-white">Answer</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={speakAnswer}
                className="dark:border-gray-600 dark:text-gray-300 bg-transparent"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Listen
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg prose dark:prose-invert max-w-none overflow-y-auto max-h-96"
              dangerouslySetInnerHTML={renderMarkdown(answer)}
            />
          </CardContent>
        </Card>
      )}

      {/* Sample Questions */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Lightbulb className="h-5 w-5" />
            Try These Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sampleQuestions.map((sampleQ, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => generateAnswer(sampleQ)}
                className="justify-start text-left h-auto p-3 dark:border-gray-600 dark:text-gray-300"
                disabled={isGenerating}
              >
                {sampleQ}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Recent Questions & Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {conversationHistory
                .slice(-3)
                .reverse()
                .map((item, index) => (
                  <div key={index} className="border-l-4 border-blue-200 dark:border-blue-600 pl-4 space-y-2">
                    <div className="font-medium text-sm text-blue-700 dark:text-blue-400">Q: {item.question}</div>
                    <div
                      className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={renderMarkdown(item.answer)}
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
