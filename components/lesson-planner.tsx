"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, BookOpen, Users, Clock, Target, Loader2 } from "lucide-react"
import { marked } from "marked" // Import marked
import DOMPurify from "dompurify" // Import DOMPurify

const subjects = [
  { id: "math", name: "Mathematics", icon: "🔢" },
  { id: "science", name: "Science/Physics/Chemistry/Biology", icon: "🔬" },
  { id: "language", name: "English Language & Literature", icon: "📚" },
  { id: "social", name: "Social Studies/History/Geography", icon: "🌍" },
  { id: "art", name: "Art & Craft", icon: "🎨" },
  { id: "computer", name: "Computer Science", icon: "💻" },
  { id: "commerce", name: "Commerce/Economics", icon: "💼" },
  { id: "hindi", name: "Hindi Language", icon: "🇮🇳" },
]

const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]

export default function LessonPlanner() {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("")
  const [lessonPlan, setLessonPlan] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateLessonPlan = async () => {
    if (!selectedSubject || !selectedGrade) return

    setIsGenerating(true)
    try {
      const subject = subjects.find((s) => s.id === selectedSubject)

      const response = await fetch("/api/perplexity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Create a comprehensive 5-day lesson plan for:

Subject: ${subject?.name}
Grade: ${selectedGrade}

Include for each day:
1. Learning objectives
2. Materials needed (simple, locally available)
3. Activities (suitable for multi-grade classroom)
4. Assessment methods
5. Homework/practice
6. Cultural connections to Indian context

Make it practical for teachers with limited resources. Use local examples, festivals, and familiar contexts. Include group activities that work in crowded classrooms. Format it clearly with day-wise breakdown using Markdown.`,
            },
          ],
          systemPrompt:
            "You are Sahayak AI creating lesson plans for Indian multi-grade classrooms. Use culturally relevant examples from rural India. Make activities practical and resource-efficient for under-resourced schools. Format your responses using Markdown.",
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

      setLessonPlan(data.content || "Failed to generate lesson plan.")
    } catch (error) {
      console.error("Error generating lesson plan:", error)
      setLessonPlan(
        `Sorry, there was an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPlan = () => {
    if (!lessonPlan) return

    const element = document.createElement("a")
    const file = new Blob([lessonPlan], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `lesson-plan-${selectedSubject}-grade${selectedGrade}-${Date.now()}.txt`
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
      {/* Selection Form */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Calendar className="h-5 w-5" />
            Weekly Lesson Planner
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Generate comprehensive 5-day lesson plans with activities and assessments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-300">Select Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Choose subject" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id} className="dark:text-white dark:focus:bg-gray-600">
                      <div className="flex items-center gap-2">
                        <span>{subject.icon}</span>
                        <span>{subject.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-300">Select Grade</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Choose grade" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade} className="dark:text-white dark:focus:bg-gray-600">
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generateLessonPlan}
            disabled={!selectedSubject || !selectedGrade || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Lesson Plan...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Generate 5-Day Lesson Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Lesson Plan */}
      {lessonPlan && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Calendar className="h-5 w-5" />
                {subjects.find((s) => s.id === selectedSubject)?.name} - Grade {selectedGrade}
              </CardTitle>
              <Button
                variant="outline"
                onClick={downloadPlan}
                className="dark:border-gray-600 dark:text-gray-300 bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Plan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg prose dark:prose-invert max-w-none text-sm max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={renderMarkdown(lessonPlan)}
            />
          </CardContent>
        </Card>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <h3 className="font-medium mb-1 dark:text-white">Learning Objectives</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Clear, measurable goals for each day</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <h3 className="font-medium mb-1 dark:text-white">Group Activities</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Collaborative learning for multi-grade classes</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
            <h3 className="font-medium mb-1 dark:text-white">Time Management</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Structured timing for each activity</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <h3 className="font-medium mb-1 dark:text-white">Local Context</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Culturally relevant examples and stories</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
