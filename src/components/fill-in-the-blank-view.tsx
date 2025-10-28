"use client"

import { useState } from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react"

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
    <div className="space-y-6 text-slate-100">
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
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-500 via-emerald-500 to-fuchsia-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
        />
      </div>

      <Card className="border-white/10 bg-slate-950/60 text-slate-100 shadow-2xl backdrop-blur">
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-center text-2xl font-semibold leading-relaxed text-white">
            {current.sentence.split("_____").map((part, i, parts) => (
              <span key={`part-${i}`}>
                {part}
                {i < parts.length - 1 && (
                  <span className="mx-2 inline-flex h-10 w-24 items-center justify-center rounded-full border border-dashed border-white/40 text-sm text-slate-200">
                    ______
                  </span>
                )}
              </span>
            ))}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {current.options.map((option) => {
          const isSelected = selected === option
          const isCorrectOption = option === current.correct
          const isWrongSelected = submitted && isSelected && !isCorrect

          let classes =
            "h-auto rounded-2xl border border-white/10 bg-white/5 py-4 text-base font-medium text-slate-100 transition-colors hover:bg-white/15 disabled:opacity-80"

          if (isSelected && !submitted) {
            classes = "h-auto rounded-2xl border border-sky-400/50 bg-sky-500/15 py-4 text-base font-medium text-sky-100"
          }

          if (submitted) {
            if (isCorrectOption) {
              classes = "h-auto rounded-2xl border border-emerald-400/40 bg-emerald-500/15 py-4 text-base font-medium text-emerald-100"
            } else if (isWrongSelected) {
              classes = "h-auto rounded-2xl border border-rose-400/40 bg-rose-500/15 py-4 text-base font-medium text-rose-100"
            } else {
              classes = "h-auto rounded-2xl border border-white/10 bg-white/5 py-4 text-base font-medium text-slate-200"
            }
          }

          return (
            <Button
              key={option}
              onClick={() => !submitted && setSelected(option)}
              disabled={submitted}
              className={classes}
            >
              {option}
            </Button>
          )
        })}
      </div>

      {submitted && (
        <Card
          className={
            isCorrect ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100" : "border-rose-400/40 bg-rose-500/10 text-rose-100"
          }
        >
          <CardContent className="space-y-2 p-5 text-sm">
            <p className="font-semibold">{isCorrect ? "Nice work!" : "Keep going"}</p>
            <p>{current.explanation}</p>
          </CardContent>
        </Card>
      )}

      {!submitted && (
        <Button
          onClick={handleSubmit}
          disabled={!selected}
          className="w-full gap-2 bg-emerald-500 text-slate-900 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-300"
        >
          Check answer
        </Button>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 gap-2 border border-white/10 bg-white/5 text-slate-100 hover:bg-white/15 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentIndex === exercises.length - 1 || !submitted}
          className="flex-1 gap-2 bg-sky-500 text-white hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-300"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Card className="flex-1 border-white/10 bg-white/5 text-slate-200">
          <CardContent className="p-4 text-sm">
            Correct answers: <span className="font-semibold text-white">{correct.length}</span> /{" "}
            <span className="font-semibold text-white">{exercises.length}</span>
          </CardContent>
        </Card>
        <Button
          variant="ghost"
          onClick={() => {
            setSelected(null)
            setSubmitted(false)
            setCorrect([])
            setCurrentIndex(0)
          }}
          className="gap-2 border border-white/10 bg-white/5 text-slate-100 hover:bg-white/15"
        >
          <RotateCw className="h-4 w-4" />
          Reset set
        </Button>
      </div>
    </div>
  )
}
