"use client"
import { useState } from "react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle, XCircle } from "lucide-react"

interface FillInTheBlankExercise {
  id: string
  sentence: string
  blank: string
  hint?: string
}

interface FillInTheBlankProps {
  exercises: FillInTheBlankExercise[]
  title?: string
}

export function FillInTheBlank({ exercises, title }: FillInTheBlankProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState<Set<string>>(new Set())

  const currentExercise = exercises[currentIndex]
  const progress = ((currentIndex + 1) / exercises.length) * 100
  const isAnswered = answered.has(currentExercise.id)

  const handleSubmit = () => {
    const isCorrect = userAnswer.toLowerCase().trim() === currentExercise.blank.toLowerCase().trim()
    setCorrect(isCorrect)
    setSubmitted(true)

    if (isCorrect && !isAnswered) {
      setScore(score + 1)
      setAnswered(new Set([...answered, currentExercise.id]))
    }
  }

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserAnswer("")
      setSubmitted(false)
      setCorrect(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setUserAnswer("")
      setSubmitted(false)
      setCorrect(false)
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setUserAnswer("")
    setSubmitted(false)
    setCorrect(false)
    setScore(0)
    setAnswered(new Set())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !submitted) {
      handleSubmit()
    }
  }

  return (
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-bold text-foreground">{title}</h2>}

      {/* Progress Bar */}
      <div>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted-foreground">
            Exercise {currentIndex + 1} of {exercises.length}
          </span>
          <span className="font-semibold text-primary">
            {score}/{exercises.length} correct
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Exercise Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fill in the blank</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sentence with Blank */}
          <div className="rounded-lg bg-muted p-6">
            <p className="text-center text-lg leading-relaxed text-foreground">
              {currentExercise.sentence.split("_").map((part, index) => (
                <span key={index}>
                  {part}
                  {index < currentExercise.sentence.split("_").length - 1 && (
                    <span className="mx-2 inline-block h-8 w-24 border-b-2 border-primary" />
                  )}
                </span>
              ))}
            </p>
          </div>

          {/* Hint */}
          {currentExercise.hint && (
            <div className="rounded-lg bg-accent/10 p-3 text-sm text-accent-foreground">
              <span className="font-semibold">Hint:</span> {currentExercise.hint}
            </div>
          )}

          {/* Input Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your answer:</label>
            <Input
              type="text"
              placeholder="Type your answer here..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={submitted}
              className="text-base"
            />
          </div>

          {/* Feedback */}
          {submitted && (
            <div
              className={`flex items-start gap-3 rounded-lg p-4 ${
                correct ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"
              }`}
            >
              {correct ? (
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              )}
              <div>
                <p className="font-semibold">{correct ? "Correct!" : "Incorrect"}</p>
                {!correct && (
                  <p className="mt-1 text-sm">
                    The correct answer is: <span className="font-semibold">{currentExercise.blank}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!submitted && (
            <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
              Check Answer
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex === exercises.length - 1}
          className="flex items-center gap-2 bg-transparent"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="ml-auto flex items-center gap-2 bg-transparent"
        >
          <RotateCw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Completion Message */}
      {currentIndex === exercises.length - 1 && submitted && (
        <div className="rounded-lg bg-blue-50 p-4 text-center text-blue-900">
          <p className="font-semibold">
            You've completed all exercises! Score: {score}/{exercises.length}
          </p>
        </div>
      )}
    </div>
  )
}
