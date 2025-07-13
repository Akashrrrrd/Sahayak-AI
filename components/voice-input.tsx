"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Mic, MicOff, Volume2, Download, Loader2 } from "lucide-react"
import { marked } from "marked" // Import marked
import DOMPurify from "dompurify" // Import DOMPurify

export default function VoiceInput() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const recognitionRef = useRef<any>(null)

  const startListening = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-IN"

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript)
        }
      }

      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const generateContent = async () => {
    if (!transcript.trim()) return

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
              content: `Teacher's request: "${transcript}"\n\nGenerate appropriate teaching content, story, or explanation based on this request. Make it engaging and suitable for Indian students in grades 1-12. Use simple English and include cultural references to rural India. Format your response using Markdown.`,
            },
          ],
          systemPrompt:
            "You are Sahayak AI, a teaching assistant for Indian classrooms. Create educational content that is culturally relevant to rural India. Use local examples, analogies from village life, and simple explanations suitable for multi-grade classrooms (Grades 1-12). Format your responses using Markdown.",
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

      setGeneratedContent(data.content || "No content generated. Please try again.")
    } catch (error) {
      console.error("Error generating content:", error)
      setGeneratedContent(
        `Sorry, there was an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const speakContent = () => {
    if ("speechSynthesis" in window && generatedContent) {
      const utterance = new SpeechSynthesisUtterance(generatedContent)
      utterance.lang = "en-IN"
      speechSynthesis.speak(utterance)
    }
  }

  const downloadContent = () => {
    const element = document.createElement("a")
    const file = new Blob([generatedContent], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `sahayak-content-${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Function to render Markdown safely
  const renderMarkdown = (markdown: string) => {
    const html = marked.parse(markdown)
    const sanitizedHtml = DOMPurify.sanitize(html as string) // marked.parse can return string or Promise<string>
    return { __html: sanitizedHtml }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Voice Input Card */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Mic className="h-5 w-5" />
            Voice Content Generator
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Speak your teaching request and get instant educational content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={isListening ? stopListening : startListening}
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Listening
                </>
              )}
            </Button>
            {isListening && (
              <Badge variant="secondary" className="animate-pulse">
                🎤 Listening...
              </Badge>
            )}
          </div>

          {transcript && (
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-300">Your Voice Input:</label>
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Your voice input will appear here..."
                className="min-h-[100px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Button onClick={generateContent} disabled={isGenerating} className="w-full sm:w-auto">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Teaching Content"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedContent && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Generated Teaching Content</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={speakContent}
                className="dark:border-gray-600 dark:text-gray-300 bg-transparent"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Listen
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadContent}
                className="dark:border-gray-600 dark:text-gray-300 bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg prose dark:prose-invert max-w-none overflow-y-auto max-h-96"
              dangerouslySetInnerHTML={renderMarkdown(generatedContent)}
            />
          </CardContent>
        </Card>
      )}

      {/* Example Prompts */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Example Voice Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                Grade 1-5 (Primary)
              </Badge>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• "Tell a story about counting using village animals"</li>
                <li>• "Explain colors using flowers and fruits"</li>
                <li>• "Create a rhyme about family members"</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                Grade 6-10 (Secondary)
              </Badge>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• "Explain photosynthesis using village farming examples"</li>
                <li>• "Create algebra problems using market scenarios"</li>
                <li>• "Explain Indian history using local monuments"</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                Grade 11-12 (Higher Secondary)
              </Badge>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• "Explain calculus concepts for JEE preparation"</li>
                <li>• "Create chemistry problems for NEET exam"</li>
                <li>• "Discuss economic policies affecting rural India"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
