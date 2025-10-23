"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react"

interface Flashcard {
  id: string
  front: string
  back: string
  order_index: number
}

export default function FlashcardLearner({
  flashcards,
  onMarkedChange,
}: {
  flashcards: Flashcard[]
  onMarkedChange?: (count: number) => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [markedCards, setMarkedCards] = useState<Record<string, boolean>>({})

  const currentCard = flashcards[currentIndex]
  const isMarked = Boolean(markedCards[currentCard.id])
  const markedCount = Object.keys(markedCards).length

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleMark = () => {
    setMarkedCards((prev) => {
      const next = { ...prev }
      if (next[currentCard.id]) {
        delete next[currentCard.id]
      } else {
        next[currentCard.id] = true
      }
      onMarkedChange?.(Object.keys(next).length)
      return next
    })
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setMarkedCards({})
    onMarkedChange?.(0)
  }

  return (
    <div className="space-y-6 text-slate-900 transition dark:text-slate-100">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="border-slate-200/60 bg-white text-slate-700 transition dark:border-white/10 dark:bg-white/10 dark:text-white">
          Flashcard carousel
        </Badge>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          {currentIndex + 1} / {flashcards.length}
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full border border-slate-200/60 bg-white/70 transition dark:border-white/10 dark:bg-white/5">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-400 to-indigo-400 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
        />
      </div>

      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="group cursor-pointer"
        role="button"
        aria-pressed={isFlipped}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            setIsFlipped((previous) => !previous)
          }
        }}
      >
        <Card className="relative flex min-h-[18rem] items-center justify-center overflow-hidden border-slate-200/60 bg-gradient-to-br from-sky-100 via-indigo-200 to-blue-200 text-slate-900 shadow-2xl backdrop-blur transition dark:border-white/10 dark:bg-gradient-to-br dark:from-sky-600/60 dark:via-indigo-700/70 dark:to-blue-900/70 dark:text-white">
          <div className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-60 [background:radial-gradient(circle_at_top,_rgba(255,255,255,0.18),transparent_60%)]" />
          <CardContent className="relative w-full space-y-6 p-8 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500 dark:text-white/70">
              {isFlipped ? "Answer" : "Prompt"}
            </p>
            <p className="text-balance text-2xl font-semibold leading-relaxed text-slate-900 dark:text-white md:text-3xl">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
            <p className="text-xs text-slate-500 dark:text-white/60">Tap or press space to flip</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button
          onClick={handleMark}
          className={`gap-2 border border-slate-200/60 transition ${
            isMarked
              ? "bg-emerald-500 text-white hover:bg-emerald-400 dark:bg-emerald-500/80 dark:hover:bg-emerald-400"
              : "bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/15"
          }`}
        >
          {isMarked ? "Marked for review" : "Mark for review"}
        </Button>
        <Button
          onClick={handleReset}
          variant="ghost"
          className="gap-2 border border-slate-200/60 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/15"
        >
          <RotateCw className="h-4 w-4" />
          Reset deck
        </Button>
      </div>

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
          disabled={currentIndex === flashcards.length - 1}
          className="flex-1 gap-2 bg-sky-500 text-white hover:bg-sky-400 disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-300"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {markedCount > 0 && (
        <Card className="border-amber-200 bg-amber-50 text-amber-700 transition dark:border-white/10 dark:bg-amber-500/10 dark:text-amber-100">
          <CardContent className="flex items-start gap-3 p-5 text-sm">
            <div>
              <p className="font-medium">Saved for more practice</p>
              <p className="text-amber-600 dark:text-amber-200">
                You’ve flagged {markedCount} card{markedCount !== 1 ? "s" : ""} to revisit. Keep reviewing until each
                feels effortless.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
