"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { LessonQuestion } from "@/types/lesson"

const YES_NO_LABELS: Record<"A" | "B" | "C", string> = {
  A: "Yes",
  B: "No",
  C: "Not Given",
}

export default function QuestionPractice({
  questions,
  onAnswerQuestion,
}: {
  questions: LessonQuestion[]
  onAnswerQuestion: (questionId: string, selectedAnswer: string, isCorrect: boolean) => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const currentQuestion = questions[currentIndex]
  const isAnswered = answers[currentQuestion.id] !== undefined
  const isCorrect = answers[currentQuestion.id] === currentQuestion.correct_answer
  const isYesNo = currentQuestion.question_type === "yes-no-not-given"

  const baseOptions = [
    { key: "A", text: currentQuestion.option_a },
    { key: "B", text: currentQuestion.option_b },
    { key: "C", text: currentQuestion.option_c },
    { key: "D", text: currentQuestion.option_d },
  ]

  const options = (isYesNo ? baseOptions.slice(0, 3) : baseOptions).map((option) => ({
    ...option,
    text: option.text?.trim()
      ? option.text
      : isYesNo && option.key !== "D"
        ? YES_NO_LABELS[option.key as keyof typeof YES_NO_LABELS]
        : `Option ${option.key}`,
  }))

  const handleSelectAnswer = (key: string) => {
    if (!isAnswered) {
      setSelectedAnswer(key)
    }
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer) {
      const correct = selectedAnswer === currentQuestion.correct_answer
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: selectedAnswer }))
      setShowResult(true)
      onAnswerQuestion(currentQuestion.id, selectedAnswer, correct)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelectedAnswer(answers[questions[currentIndex - 1].id] || null)
      setShowResult(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Counter */}
      <div className="text-center text-sm text-gray-600">
        Question {currentIndex + 1} of {questions.length}
      </div>

      {/* Question */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question_text}</CardTitle>
          {isYesNo && <p className="text-sm text-gray-500">Choose whether the statement is Yes, No, or Not Given.</p>}
        </CardHeader>
      </Card>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.key
          const isCorrectOption = option.key === currentQuestion.correct_answer
          const isWrongSelected = isSelected && !isCorrect

          let bgColor = "bg-white hover:bg-gray-50"
          let borderColor = "border-gray-200"

          if (showResult) {
            if (isCorrectOption) {
              bgColor = "bg-green-50"
              borderColor = "border-green-300"
            } else if (isWrongSelected) {
              bgColor = "bg-red-50"
              borderColor = "border-red-300"
            }
          } else if (isSelected) {
            bgColor = "bg-blue-50"
            borderColor = "border-blue-300"
          }

          return (
            <button
              key={option.key}
              onClick={() => handleSelectAnswer(option.key)}
              disabled={isAnswered}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${bgColor} ${borderColor} ${
                isAnswered ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                  }`}
                >
                  {isSelected && <span className="text-white text-sm font-bold">✓</span>}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{option.key}</p>
                  <p className="text-gray-700">{option.text}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Result Feedback */}
      {showResult && (
        <Card className={`border-0 shadow-md ${isCorrect ? "bg-green-50" : "bg-red-50"}`}>
          <CardContent className="pt-6">
            <p className={`font-semibold mb-2 ${isCorrect ? "text-green-900" : "text-red-900"}`}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>
            {currentQuestion.explanation && (
              <p className={`text-sm ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                {currentQuestion.explanation}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      {!isAnswered && (
        <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="w-full">
          Submit Answer
        </Button>
      )}

      {/* Navigation */}
      {isAnswered && (
        <div className="flex gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="outline"
            className="flex-1 gap-2 bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button onClick={handleNext} disabled={currentIndex === questions.length - 1} className="flex-1 gap-2">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
