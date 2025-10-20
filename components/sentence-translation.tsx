"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle, XCircle } from "lucide-react"

interface TranslationExercise {
  id: string
  sentence: string
  sourceLanguage: string
  targetLanguage: string
  correctTranslation: string
  options: string[]
}

interface SentenceTranslationProps {
  exercises: TranslationExercise[]
  title?: string
}

export function SentenceTranslation({ exercises, title }: SentenceTranslationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState<Set<string>>(new Set())

  const currentExercise = exercises[currentIndex]
  const progress = ((currentIndex + 1) / exercises.length) * 100
  const isAnswered = answered.has(currentExercise.id)

  const handleSubmit = () => {
    if (!selectedAnswer) return

    const isCorrect = selectedAnswer === currentExercise.correctTranslation
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
      setSelectedAnswer(null)
      setSubmitted(false)
      setCorrect(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelectedAnswer(null)
      setSubmitted(false)
      setCorrect(false)
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setSubmitted(false)
    setCorrect(false)
    setScore(0)
    setAnswered(new Set())
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
          <CardTitle className="text-lg">Translate the sentence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Labels and Sentence */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-muted p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                {currentExercise.sourceLanguage}
              </p>
              <p className="text-lg font-semibold text-foreground">{currentExercise.sentence}</p>
            </div>
            <div className="rounded-lg bg-accent/10 p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-accent-foreground">
                {currentExercise.targetLanguage}
              </p>
              <p className="text-lg font-semibold text-accent-foreground">
                {submitted ? currentExercise.correctTranslation : "?"}
              </p>
            </div>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Choose the correct translation:</p>
            <div className="space-y-2">
              {currentExercise.options.map((option) => (
                <button
                  key={option}
                  onClick={() => !submitted && setSelectedAnswer(option)}
                  disabled={submitted}
                  className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                    selectedAnswer === option
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  } ${
                    submitted
                      ? option === currentExercise.correctTranslation
                        ? "border-green-500 bg-green-50"
                        : option === selectedAnswer && !correct
                          ? "border-red-500 bg-red-50"
                          : ""
                      : ""
                  } disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded-full border-2 ${
                        selectedAnswer === option ? "border-primary bg-primary" : "border-border"
                      }`}
                    />
                    <span className="font-medium text-foreground">{option}</span>
                  </div>
                </button>
              ))}
            </div>
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
                    The correct translation is:{" "}
                    <span className="font-semibold">{currentExercise.correctTranslation}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!submitted && (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
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
