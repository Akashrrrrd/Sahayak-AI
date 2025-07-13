"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Globe } from "lucide-react"

const languages = [
  { code: "hindi", name: "हिंदी (Hindi)", flag: "🇮🇳" },
  { code: "marathi", name: "मराठी (Marathi)", flag: "🇮🇳" },
  { code: "tamil", name: "தமிழ் (Tamil)", flag: "🇮🇳" },
  { code: "kannada", name: "ಕನ್ನಡ (Kannada)", flag: "🇮🇳" },
  { code: "telugu", name: "తెలుగు (Telugu)", flag: "🇮🇳" },
  { code: "gujarati", name: "ગુજરાતી (Gujarati)", flag: "🇮🇳" },
  { code: "bengali", name: "বাংলা (Bengali)", flag: "🇮🇳" },
  { code: "english", name: "English", flag: "🇬🇧" },
]

interface LanguageSelectorProps {
  selectedLanguage: string
  onLanguageChange: (language: string) => void
}

export default function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  const currentLanguage = languages.find((lang) => lang.code === selectedLanguage)

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Globe className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-700">Select Teaching Language</span>
        </div>
        <Select value={selectedLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-full">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{currentLanguage?.flag}</span>
                <span>{currentLanguage?.name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                <div className="flex items-center gap-2">
                  <span>{language.flag}</span>
                  <span>{language.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
