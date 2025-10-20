"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

const translations = [
  {
    id: 1,
    english: "The weather is beautiful today.",
    reference: "Thời tiết hôm nay rất đẹp.",
    hint: 'Start with "Thời tiết"',
  },
  {
    id: 2,
    english: "I have been learning English for three years.",
    reference: "Tôi đã học tiếng Anh trong ba năm.",
    hint: 'Use "đã học" for past action continuing to present',
  },
  {
    id: 3,
    english: "Can you help me with this problem?",
    reference: "Bạn có thể giúp tôi với vấn đề này không?",
    hint: 'Use "có thể" for ability/possibility',
  },
  {
    id: 4,
    english: "She is interested in learning new languages.",
    reference: "Cô ấy quan tâm đến việc học các ngôn ngữ mới.",
    hint: 'Use "quan tâm đến" for interest',
  },
]

export default function TranslationView() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userTranslation, setUserTranslation] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showReference, setShowReference] = useState(false)

  const current = translations[currentIndex]

  const handleNext = () => {
    if (currentIndex < translations.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserTranslation("")
      setSubmitted(false)
      setShowHint(false)
      setShowReference(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setUserTranslation("")
      setSubmitted(false)
      setShowHint(false)
      setShowReference(false)
    }
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-600">
          Sentence {currentIndex + 1} of {translations.length}
        </div>
        <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
            style={{ width: `${((currentIndex + 1) / translations.length) * 100}%` }}
          />
        </div>
      </div>

      {/* English Sentence */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="pt-8">
          <p className="text-center text-lg font-semibold text-gray-900">"{current.english}"</p>
          <p className="mt-4 text-center text-sm text-blue-600">Translate this sentence to Vietnamese</p>
        </CardContent>
      </Card>

      {/* Translation Input */}
      <div className="space-y-3">
        <Textarea
          placeholder="Enter your translation here..."
          value={userTranslation}
          onChange={(e) => setUserTranslation(e.target.value)}
          disabled={submitted}
          className="min-h-24 resize-none border-2 border-blue-200 focus:border-blue-500"
        />
      </div>

      {/* Hint Button */}
      {!submitted && (
        <Button
          variant="outline"
          onClick={() => setShowHint(!showHint)}
          className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
        >
          {showHint ? "Hide Hint" : "Show Hint"}
        </Button>
      )}

      {/* Hint */}
      {showHint && !submitted && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-900">{current.hint}</p>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      {!submitted && (
        <Button
          onClick={handleSubmit}
          disabled={!userTranslation.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-base font-semibold"
        >
          Submit Translation
        </Button>
      )}

      {/* Reference Translation */}
      {submitted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase text-green-700">Your Translation</p>
                <p className="mt-2 text-gray-900">{userTranslation}</p>
              </div>
              <div className="border-t border-green-200 pt-3">
                <p className="text-xs font-semibold uppercase text-green-700">Reference Translation</p>
                <p className="mt-2 text-gray-900">{current.reference}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0} className="flex-1 bg-transparent">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentIndex === translations.length - 1 || !submitted}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
