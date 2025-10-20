"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const exercises = [
  {
    id: 1,
    sentence: "The cat is _____ on the mat.",
    options: ["sleeping", "running", "jumping", "eating"],
    correct: "sleeping",
    explanation: 'The sentence describes a cat resting on a mat, so "sleeping" is the most appropriate choice.',
  },
  {
    id: 2,
    sentence: "She _____ to the store every morning.",
    options: ["goes", "going", "gone", "go"],
    correct: "goes",
    explanation: 'With "every morning" (habitual action), we use the simple present tense "goes".',
  },
  {
    id: 3,
    sentence: "I have never _____ such a beautiful sunset.",
    options: ["see", "seen", "seeing", "sees"],
    correct: "seen",
    explanation: 'After "have never", we use the past participle "seen".',
  },
  {
    id: 4,
    sentence: "The meeting was _____ until next week.",
    options: ["postponed", "postpone", "postponing", "postpones"],
    correct: "postponed",
    explanation: 'In passive voice, we use the past participle "postponed".',
  },
]

export default function FillInTheBlankView() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState<number[]>([])

  const current = exercises[currentIndex]
  const isCorrect = selected === current.correct
  const hasAnswered = correct.includes(current.id)

  const handleSubmit = () => {
    if (selected) {
      setSubmitted(true)
      if (isCorrect) {
        setCorrect((prev) => [...prev, current.id])
      }
    }
  }

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelected(null)
      setSubmitted(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelected(null)
      setSubmitted(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-600">
          Question {currentIndex + 1} of {exercises.length}
        </div>
        <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
            style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="pt-8">
          <p className="text-center text-xl font-semibold text-gray-900">
            {current.sentence.split("_____").map((part, i) => (
              <span key={i}>
                {part}
                {i < current.sentence.split("_____").length - 1 && (
                  <span className="mx-2 inline-block h-8 w-16 border-b-2 border-blue-600" />
                )}
              </span>
            ))}
          </p>
        </CardContent>
      </Card>

      {/* Options */}
      <div className="grid gap-3 sm:grid-cols-2">
        {current.options.map((option) => (
          <Button
            key={option}
            onClick={() => !submitted && setSelected(option)}
            disabled={submitted}
            variant={selected === option ? "default" : "outline"}
            className={`h-auto py-4 text-base font-medium transition-all ${
              selected === option
                ? submitted
                  ? isCorrect
                    ? "bg-green-600 hover:bg-green-700 border-green-600"
                    : "bg-red-600 hover:bg-red-700 border-red-600"
                  : "bg-blue-600 hover:bg-blue-700 border-blue-600"
                : submitted && option === current.correct
                  ? "bg-green-100 border-green-300 text-green-900"
                  : ""
            }`}
          >
            {option}
          </Button>
        ))}
      </div>

      {/* Feedback */}
      {submitted && (
        <Card className={isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardContent className="pt-6">
            <p className={`font-semibold ${isCorrect ? "text-green-900" : "text-red-900"}`}>
              {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
            </p>
            <p className="mt-2 text-sm text-gray-700">{current.explanation}</p>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      {!submitted && (
        <Button
          onClick={handleSubmit}
          disabled={!selected}
          className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-base font-semibold"
        >
          Check Answer
        </Button>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0} className="flex-1 bg-transparent">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentIndex === exercises.length - 1 || !submitted}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-700">
            Correct answers: <span className="font-bold text-blue-600">{correct.length}</span> out of{" "}
            <span className="font-bold text-blue-600">{exercises.length}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
