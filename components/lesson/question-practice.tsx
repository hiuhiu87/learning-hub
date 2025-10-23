"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  isLocked = false,
  lockMessage,
}: {
  questions: LessonQuestion[]
  onAnswerQuestion: (questionId: string, selectedAnswer: string, isCorrect: boolean) => void
  isLocked?: boolean
  lockMessage?: string
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
    if (!isAnswered && !isLocked) {
      setSelectedAnswer(key)
    }
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer && !isLocked) {
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
    <div className="space-y-6 text-slate-900 transition dark:text-slate-100">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="border-slate-200/60 bg-white text-slate-700 transition dark:border-white/10 dark:bg-white/10 dark:text-white">
          Practice checkpoint
        </Badge>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full border border-slate-200/60 bg-white/70 transition dark:border-white/10 dark:bg-white/5">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {isLocked && lockMessage && (
        <Card className="border-amber-200 bg-amber-50 text-amber-700 transition dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-100">
          <CardContent className="p-5 text-sm">
            <p>{lockMessage}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200/60 bg-white/80 text-slate-900 shadow-2xl backdrop-blur transition dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100">
        <CardHeader className="space-y-3">
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">{currentQuestion.question_text}</CardTitle>
          {isYesNo && (
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Decide whether the statement aligns with the prompt: choose Yes, No, or Not Given.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {options.map((option) => {
            const isSelected = selectedAnswer === option.key
            const isCorrectOption = option.key === currentQuestion.correct_answer
            const isWrongSelected = isSelected && !isCorrect

            const baseClasses =
              "w-full rounded-2xl border px-4 py-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base"

            let classes =
              "border-slate-200/60 bg-white text-slate-700 hover:bg-slate-100 focus-visible:border-sky-400 focus-visible:ring-offset-0 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/15"

            if (showResult) {
              if (isCorrectOption) {
                classes =
                  "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/50 dark:bg-emerald-500/10 dark:text-emerald-100"
              } else if (isWrongSelected) {
                classes =
                  "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/50 dark:bg-rose-500/10 dark:text-rose-100"
              } else {
                classes =
                  "border-slate-200/60 bg-white text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              }
            } else if (isSelected) {
              classes = "border-sky-400/60 bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-100"
            }

            return (
              <button
                key={option.key}
                onClick={() => handleSelectAnswer(option.key)}
                disabled={isAnswered || isLocked}
                className={`${baseClasses} ${classes} ${isAnswered || isLocked ? "cursor-default opacity-80" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-sky-300 bg-sky-400/80 text-slate-900"
                        : "border-slate-200/60 bg-white text-slate-500 dark:border-white/20 dark:bg-white/10 dark:text-slate-200"
                    }`}
                  >
                    <span className="text-sm font-semibold">{option.key}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{option.text}</p>
                    {showResult && isCorrectOption && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-200">This is the correct answer.</p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </CardContent>
      </Card>

      {showResult && (
        <Card
          className={
            isCorrect
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 transition dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-100"
              : "border-rose-200 bg-rose-50 text-rose-700 transition dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-100"
          }
        >
          <CardContent className="space-y-2 p-5 text-sm">
            <p className="font-semibold">{isCorrect ? "Great job! 🎉" : "Not quite right yet."}</p>
            {currentQuestion.explanation ? (
              <p>{currentQuestion.explanation}</p>
            ) : (
              <p>
                {isCorrect
                  ? "Keep the momentum going with the next question."
                  : "Review the flashcards, then give it another shot."}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {!isAnswered && (
        <Button
          onClick={handleSubmitAnswer}
          disabled={!selectedAnswer || isLocked}
          className="w-full gap-2 bg-emerald-500 text-white hover:bg-emerald-400 disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-300"
        >
          Submit answer
        </Button>
      )}

      {isAnswered && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="ghost"
            className="flex-1 gap-2 border border-slate-200/60 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/15"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="flex-1 gap-2 bg-sky-500 text-white hover:bg-sky-400 disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-300"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
