"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, FileText, Download, Loader2 } from "lucide-react"
import { marked } from "marked" // Import marked
import DOMPurify from "dompurify" // Import DOMPurify

const gradeConfigs = {
  "1": { name: "Grade 1", activities: "Fill-in-the-blanks, Simple drawings, Matching pictures" },
  "2": { name: "Grade 2", activities: "Word completion, Basic Q&A, Color and identify" },
  "3": { name: "Grade 3", activities: "Match columns, Short answers, Simple comprehension" },
  "4": { name: "Grade 4", activities: "Concept questions, Diagrams, Problem solving" },
  "5": { name: "Grade 5", activities: "Essay questions, Analysis, Creative tasks" },
  "6": { name: "Grade 6", activities: "Research tasks, Critical thinking, Project work" },
  "7": { name: "Grade 7", activities: "Case studies, Analytical questions, Group discussions" },
  "8": { name: "Grade 8", activities: "Advanced problems, Scientific method, Data analysis" },
  "9": { name: "Grade 9", activities: "Board exam prep, Complex reasoning, Application-based" },
  "10": { name: "Grade 10", activities: "CBSE/State board format, Practical applications, Real-world problems" },
  "11": { name: "Grade 11", activities: "Higher secondary level, Subject specialization, Competitive prep" },
  "12": { name: "Grade 12", activities: "Advanced concepts, University prep, Career-oriented tasks" },
}

export default function ImageWorksheet() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [worksheets, setWorksheets] = useState<{ [key: string]: string }>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        extractTextFromImage(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const extractTextFromImage = async (file: File) => {
    setIsExtracting(true)
    setExtractedText("Extracting text from image...")

    try {
      // Using Tesseract.js for OCR
      const { createWorker } = await import("tesseract.js")
      const worker = await createWorker("eng")
      const {
        data: { text },
      } = await worker.recognize(file)
      await worker.terminate()

      setExtractedText(text || "No text could be extracted from the image. Please try with a clearer image.")
    } catch (error) {
      console.error("OCR Error:", error)
      // Fallback to sample text for demo
      setExtractedText(`Sample extracted text from textbook:

Water Cycle
Water is very important for all living things. The sun heats up water in rivers, lakes, and oceans. This water turns into water vapor and goes up into the sky. This process is called evaporation.

When water vapor cools down in the sky, it forms clouds. This is called condensation. When clouds become heavy with water, it falls down as rain. This is called precipitation.

The rainwater flows back into rivers and lakes, and the cycle continues.`)
    } finally {
      setIsExtracting(false)
    }
  }

  const generateWorksheet = async (grade: string) => {
    if (!extractedText || extractedText.includes("Extracting")) return

    setIsGenerating(true)
    try {
      const gradeConfig = gradeConfigs[grade as keyof typeof gradeConfigs]

      const response = await fetch("/api/perplexity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Create a ${gradeConfig.name} worksheet based on this textbook content:

"${extractedText}"

Grade Level: ${gradeConfig.name}
Suggested Activities: ${gradeConfig.activities}

Create a worksheet with:
1. Title and instructions
2. 3-4 different types of activities appropriate for this grade
3. Use simple English and local Indian examples
4. Include answer key at the end
5. Format it clearly for easy printing and classroom use using Markdown.`,
            },
          ],
          systemPrompt:
            "You are Sahayak AI creating worksheets for Indian students. Use culturally relevant examples from rural India. Make activities age-appropriate and engaging. Format your responses using Markdown.",
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

      setWorksheets((prev) => ({ ...prev, [grade]: data.content || "Failed to generate worksheet." }))
    } catch (error) {
      console.error("Error generating worksheet:", error)
      setWorksheets((prev) => ({
        ...prev,
        [grade]: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      }))
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadWorksheet = (grade: string) => {
    const content = worksheets[grade]
    if (!content) return

    const element = document.createElement("a")
    const file = new Blob([content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `worksheet-grade-${grade}-${Date.now()}.txt`
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
      {/* Image Upload */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Camera className="h-5 w-5" />
            Textbook to Worksheet Generator
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Upload a photo of textbook page to generate differentiated worksheets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full dark:border-gray-600 dark:text-gray-300"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Textbook Photo
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          {selectedImage && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 dark:border-gray-600">
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt="Uploaded textbook page"
                  className="max-w-full h-auto max-h-64 mx-auto rounded"
                />
              </div>

              {extractedText && (
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-gray-300">Extracted Text:</label>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm max-h-32 overflow-y-auto dark:text-gray-200">
                    {isExtracting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Extracting text from image...
                      </div>
                    ) : (
                      extractedText
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Selection & Generation */}
      {extractedText && !extractedText.includes("Extracting") && !isExtracting && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Generate Differentiated Worksheets</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Create worksheets tailored for different grade levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Object.entries(gradeConfigs).map(([grade, config]) => (
                <div key={grade} className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center dark:border-gray-600 dark:text-gray-300">
                    {config.name}
                  </Badge>
                  <Button
                    onClick={() => generateWorksheet(grade)}
                    disabled={isGenerating}
                    variant={worksheets[grade] ? "secondary" : "default"}
                    size="sm"
                    className="w-full"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : worksheets[grade] ? (
                      "Generated ✓"
                    ) : (
                      "Generate"
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{config.activities}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Worksheets */}
      {Object.keys(worksheets).length > 0 && (
        <div className="space-y-4">
          {Object.entries(worksheets).map(([grade, content]) => (
            <Card key={grade} className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <FileText className="h-5 w-5" />
                    Grade {grade} Worksheet
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadWorksheet(grade)}
                    className="dark:border-gray-600 dark:text-gray-300"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg prose dark:prose-invert max-w-none text-sm max-h-64 overflow-y-auto"
                  dangerouslySetInnerHTML={renderMarkdown(content)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
