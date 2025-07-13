"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, Camera, BookOpen, Calendar, MessageCircle, Palette } from "lucide-react"
import VoiceInput from "@/components/voice-input"
import ImageWorksheet from "@/components/image-worksheet"
import QuestionAnswer from "@/components/question-answer"
import LessonPlanner from "@/components/lesson-planner"
import VisualAids from "@/components/visual-aids"
import ThemeToggle from "@/components/theme-toggle"

const features = [
  {
    id: "voice",
    title: "Voice Content Generation",
    description: "Generate teaching content using voice commands",
    icon: Mic,
    color: "bg-blue-500 dark:bg-blue-600",
  },
  {
    id: "worksheet",
    title: "Image to Worksheet",
    description: "Convert textbook photos into differentiated worksheets",
    icon: Camera,
    color: "bg-green-500 dark:bg-green-600",
  },
  {
    id: "qa",
    title: "Instant Q&A",
    description: "Get immediate answers to student questions with local analogies",
    icon: MessageCircle,
    color: "bg-purple-500 dark:bg-purple-600",
  },
  {
    id: "planner",
    title: "Lesson Planner",
    description: "Create weekly lesson plans with activities and assessments",
    icon: Calendar,
    color: "bg-orange-500 dark:bg-orange-600",
  },
  {
    id: "visual",
    title: "Visual Aids",
    description: "Generate chalkboard-friendly diagrams and illustrations",
    icon: Palette,
    color: "bg-pink-500 dark:bg-pink-600",
  },
]

export default function SahayakAI() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)

  const renderFeatureComponent = () => {
    switch (activeFeature) {
      case "voice":
        return <VoiceInput />
      case "worksheet":
        return <ImageWorksheet />
      case "qa":
        return <QuestionAnswer />
      case "planner":
        return <LessonPlanner />
      case "visual":
        return <VisualAids />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center gap-3">
              <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">Sahayak AI</h1>
            </div>
            <ThemeToggle />
          </div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            AI-powered teaching assistant for India's multi-grade classrooms
          </p>
          <Badge variant="secondary" className="mt-2">
            Real-time • Powered by Perplexity AI • Culturally Relevant
          </Badge>
        </div>

        {/* Feature Grid */}
        {!activeFeature && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {features.map((feature) => {
              const IconComponent = feature.icon
              return (
                <Card
                  key={feature.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 dark:bg-gray-800 dark:border-gray-700"
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${feature.color}`}>
                        <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <CardTitle className="text-base sm:text-lg dark:text-white">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm dark:text-gray-400">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Active Feature Component */}
        {activeFeature && (
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-4 mb-4 sm:mb-6">
              <Button
                variant="outline"
                onClick={() => setActiveFeature(null)}
                className="dark:border-gray-600 dark:text-gray-300"
              >
                ← Back to Dashboard
              </Button>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">
                {features.find((f) => f.id === activeFeature)?.title}
              </h2>
            </div>
            {renderFeatureComponent()}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">AI</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Powered by Perplexity</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">12</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Grade Levels (1-12)</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">∞</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Real-time Content</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
