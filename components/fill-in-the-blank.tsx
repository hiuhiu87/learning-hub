"use client"
import { useState } from "react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
      {title && <h2 className="text-2xl font-semibold text-white">{title}</h2>}

      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="border-white/10 bg-white/10 text-white">
          Fill in the blank
        </Badge>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
          {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card className="border-white/10 bg-slate-950/60 text-slate-100 shadow-2xl backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Complete the sentence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-lg leading-relaxed text-white">
            {currentExercise.sentence.split("_").map((part, index, parts) => (
              <span key={index}>
                {part}
                {index < parts.length - 1 && (
                  <span className="mx-2 inline-flex h-9 w-24 items-center justify-center rounded-full border border-dashed border-white/40 text-sm text-slate-300">
                    ______
                  </span>
                )}
              </span>
            ))}
          </div>

          {currentExercise.hint && (
            <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 p-4 text-sm text-sky-100">
              <span className="font-semibold">Hint:</span> {currentExercise.hint}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Your answer</label>
            <Input
              type="text"
              placeholder="Type your answer here..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={submitted}
              className="border-white/15 bg-slate-950/60 text-slate-100 placeholder:text-slate-400 focus-visible:border-sky-400/60 focus-visible:ring-sky-400/40"
            />
          </div>

          {submitted && (
            <div
              className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
                correct
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                  : "border-rose-400/40 bg-rose-500/10 text-rose-100"
              }`}
            >
              {correct ? (
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              )}
              <div>
                <p className="font-semibold">{correct ? "Nice work!" : "Keep going"}</p>
                {!correct && (
                  <p className="mt-1 text-sm">
                    Correct answer: <span className="font-semibold text-white">{currentExercise.blank}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {!submitted && (
            <Button
              onClick={handleSubmit}
              className="w-full gap-2 bg-emerald-500 text-slate-900 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-300"
            >
              Check answer
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 border border-white/10 bg-white/5 text-slate-100 hover:bg-white/15 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          size="sm"
          disabled={currentIndex === exercises.length - 1}
          className="flex items-center gap-2 bg-sky-500 text-white hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-300"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="ml-auto flex items-center gap-2 border border-white/10 bg-white/5 text-slate-100 hover:bg-white/15"
        >
          <RotateCw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {currentIndex === exercises.length - 1 && submitted && (
        <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 p-4 text-center text-sky-100">
          <p className="font-semibold">
            You&apos;ve completed every prompt! Score: {score}/{exercises.length}
          </p>
        </div>
      )}
    </div>
  )
}
