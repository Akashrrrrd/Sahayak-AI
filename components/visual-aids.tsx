"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Palette, Download, Eye, Loader2, Lightbulb } from "lucide-react"
import { marked } from "marked" // Import marked
import DOMPurify from "dompurify" // Import DOMPurify

const visualTypes = [
  { id: "diagram", name: "Scientific Diagram", example: "Water cycle, plant parts, human body" },
  { id: "chart", name: "Chart/Graph", example: "Weather chart, growth chart, comparison table" },
  { id: "map", name: "Simple Map", example: "Village map, India map, classroom layout" },
  { id: "timeline", name: "Timeline", example: "Historical events, daily routine, life cycle" },
  { id: "flowchart", name: "Process Flow", example: "How to make tea, solving math problems" },
]

const samplePrompts = [
  "Draw water cycle with sun, clouds, rain, and arrows",
  "Create a chart showing different types of animals",
  "Make a simple map of our village with school, temple, and market",
  "Draw the parts of a plant with labels",
  "Show the process of making chapati step by step",
]

export default function VisualAids() {
  const [description, setDescription] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [visualAid, setVisualAid] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateVisualAid = async () => {
    if (!description.trim()) return

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
              content: `Create detailed drawing instructions for: "${description}"

Type: ${selectedType || "General diagram"}

Provide:
1. Step-by-step drawing instructions
2. What to draw first, second, etc.
3. Labels and text to add
4. Simple shapes and lines to use
5. Tips for drawing on blackboard with chalk
6. How to make it engaging for students

Make it simple enough for any teacher to draw, even with basic artistic skills. Use local examples and familiar objects where possible. Format your response using Markdown.`,
            },
          ],
          systemPrompt:
            "You are Sahayak AI creating visual aids for Indian classrooms. Create detailed instructions for drawing simple, clear diagrams that teachers can easily replicate on blackboards with chalk. Make diagrams culturally relevant to rural India. Format your responses using Markdown.",
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

      setVisualAid(data.content || "Failed to generate visual aid instructions.")
    } catch (error) {
      console.error("Error generating visual aid:", error)
      setVisualAid(
        `Sorry, there was an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadInstructions = () => {
    if (!visualAid) return

    const element = document.createElement("a")
    const file = new Blob([visualAid], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `visual-aid-instructions-${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Function to render Markdown safely
  const renderMarkdown = (markdown: string) => {
    const html = marked.parse(markdown)
    const sanitizedHtml = DOMPurify.sanitize(html as string)
    return { __html: sanitizedHtml }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Input Form */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Palette className="h-5 w-5" />
            Chalkboard Visual Aid Generator
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Get step-by-step instructions to draw educational diagrams on blackboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium dark:text-gray-300">Describe what you want to draw</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Draw water cycle with sun, clouds, rain, and arrows"
              className="min-h-[80px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium dark:text-gray-300">Visual Type (Optional)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {visualTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(selectedType === type.id ? "" : type.id)}
                  className="justify-start text-left h-auto p-3 dark:border-gray-600 dark:text-gray-300"
                >
                  <div>
                    <div className="font-medium">{type.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{type.example}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={generateVisualAid} disabled={!description.trim() || isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Instructions...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Generate Drawing Instructions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Instructions */}
      {visualAid && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="dark:text-white">Drawing Instructions</CardTitle>
              <Button
                variant="outline"
                onClick={downloadInstructions}
                className="dark:border-gray-600 dark:text-gray-300 bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg prose dark:prose-invert max-w-none text-sm max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={renderMarkdown(visualAid)}
            />
          </CardContent>
        </Card>
      )}

      {/* Sample Prompts */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Lightbulb className="h-5 w-5" />
            Try These Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {samplePrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setDescription(prompt)}
                className="justify-start text-left h-auto p-3 dark:border-gray-600 dark:text-gray-300"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
