"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
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
      {title && <h2 className="text-2xl font-semibold text-white">{title}</h2>}

      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="border-white/10 bg-white/10 text-white">
          Translation practice
        </Badge>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
          {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card className="border-white/10 bg-slate-950/60 text-slate-100 shadow-2xl backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Translate the sentence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {currentExercise.sourceLanguage}
              </p>
              <p className="text-lg font-semibold text-white">{currentExercise.sentence}</p>
            </div>
            <div className="rounded-3xl border border-sky-400/30 bg-sky-500/10 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
                {currentExercise.targetLanguage}
              </p>
              <p className="text-lg font-semibold text-sky-100">
                {submitted ? currentExercise.correctTranslation : "Reveal the correct phrase after submitting"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-300">Choose the closest translation</p>
            <div className="space-y-2">
              {currentExercise.options.map((option) => {
                const isSelected = selectedAnswer === option
                const isCorrectOption = option === currentExercise.correctTranslation
                const isWrongSelected = submitted && option === selectedAnswer && !correct

                let classes =
                  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-100 transition-colors hover:bg-white/15 disabled:hover:bg-white/5"

                if (isSelected && !submitted) {
                  classes = "w-full rounded-2xl border border-sky-400/50 bg-sky-500/15 px-4 py-3 text-left text-sm text-sky-100"
                }

                if (submitted) {
                  if (isCorrectOption) {
                    classes =
                      "w-full rounded-2xl border border-emerald-400/50 bg-emerald-500/10 px-4 py-3 text-left text-sm text-emerald-100"
                  } else if (isWrongSelected) {
                    classes =
                      "w-full rounded-2xl border border-rose-400/50 bg-rose-500/10 px-4 py-3 text-left text-sm text-rose-100"
                  } else {
                    classes =
                      "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200"
                  }
                }

                return (
                  <button
                    key={option}
                    onClick={() => !submitted && setSelectedAnswer(option)}
                    disabled={submitted}
                    className={`${classes} transition-all duration-200 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-sky-300 bg-sky-400/80 text-slate-900"
                            : "border-white/20 bg-white/10 text-slate-300"
                        }`}
                      >
                        <span className="text-xs font-semibold">{String.fromCharCode(65 + currentExercise.options.indexOf(option))}</span>
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>
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
                <p className="font-semibold">{correct ? "Perfect!" : "Almost there"}</p>
                {!correct && (
                  <p className="mt-1 text-sm">
                    Correct translation: <span className="font-semibold text-white">{currentExercise.correctTranslation}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {!submitted && (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="w-full gap-2 bg-fuchsia-500 text-white hover:bg-fuchsia-400 disabled:bg-slate-700 disabled:text-slate-300"
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
          size="sm"
          onClick={handleNext}
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
            You&apos;ve completed all translations! Score: {score}/{exercises.length}
          </p>
        </div>
      )}
    </div>
  )
}
