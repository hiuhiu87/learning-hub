"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, RotateCw, Sparkles } from "lucide-react"

const flashcards = [
  {
    id: 1,
    word: "Serendipity",
    definition: "The occurrence of events by chance in a happy or beneficial way",
    example: "Meeting her was pure serendipity.",
  },
  {
    id: 2,
    word: "Ephemeral",
    definition: "Lasting for a very short time",
    example: "The beauty of cherry blossoms is ephemeral.",
  },
  {
    id: 3,
    word: "Eloquent",
    definition: "Fluent or persuasive in speaking or writing",
    example: "The speaker gave an eloquent speech.",
  },
  {
    id: 4,
    word: "Ubiquitous",
    definition: "Present, appearing, or found everywhere",
    example: "Smartphones have become ubiquitous in modern society.",
  },
  {
    id: 5,
    word: "Melancholy",
    definition: "A feeling of pensive sadness, typically with no obvious cause",
    example: "A sense of melancholy filled the room.",
  },
]

export default function FlashcardView() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [known, setKnown] = useState<number[]>([])

  const current = flashcards[currentIndex]
  const isKnown = known.includes(current.id)

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const toggleKnown = () => {
    setKnown((prev) => (prev.includes(current.id) ? prev.filter((id) => id !== current.id) : [...prev, current.id]))
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setKnown([])
  }

  return (
    <div className="space-y-6 text-slate-900 transition dark:text-slate-100">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="border-slate-200/60 bg-white text-slate-700 transition dark:border-white/10 dark:bg-white/10 dark:text-white">
          Flashcard drill
        </Badge>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          {currentIndex + 1} / {flashcards.length}
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full border border-slate-200/60 bg-white/70 transition dark:border-white/10 dark:bg-white/5">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
        />
      </div>

      <div
        className="group perspective h-72 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        role="button"
        aria-pressed={isFlipped}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            setIsFlipped((prev) => !prev)
          }
        }}
      >
        <div
          className={`relative h-full w-full transform-gpu transition-transform duration-500 ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
          style={{ transformStyle: "preserve-3d" }}
        >
          <Card
            className="absolute h-full w-full overflow-hidden border border-slate-200/60 bg-gradient-to-br from-sky-100 via-indigo-200 to-blue-200 text-slate-900 shadow-2xl transition dark:border-white/10 dark:bg-gradient-to-br dark:from-sky-500/60 dark:via-indigo-700/60 dark:to-slate-900/70 dark:text-white"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_top,_rgba(255,255,255,0.18),transparent_60%)]" />
            <CardContent className="relative flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/70">
                <Sparkles className="h-3.5 w-3.5" />
                Word
              </span>
              <p className="text-4xl font-semibold">{current.word}</p>
              <p className="text-xs text-slate-500 dark:text-white/60">Tap to reveal definition</p>
            </CardContent>
          </Card>

          <Card
            className="absolute h-full w-full overflow-hidden border border-slate-200/60 bg-white text-slate-700 shadow-2xl backdrop-blur transition dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <CardContent className="flex h-full flex-col justify-center gap-6 p-8">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">Definition</p>
                <p className="mt-2 text-lg font-semibold">{current.definition}</p>
              </div>
              <div className="rounded-xl border border-slate-200/60 bg-white/70 p-4 text-sm text-slate-600 transition dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Example</p>
                <p className="mt-2 italic">“{current.example}”</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={toggleKnown}
          className={`flex items-center gap-2 border border-slate-200/60 transition dark:border-white/10 ${
            isKnown
              ? "bg-emerald-500 text-white hover:bg-emerald-400 dark:bg-emerald-500/80 dark:hover:bg-emerald-400"
              : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/15"
          }`}
        >
          {isKnown ? "✓ Marked as known" : "☆ Mark for review"}
        </Button>
        <Button
          variant="ghost"
          onClick={handleReset}
          className="flex flex-1 items-center gap-2 border border-slate-200/60 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/15"
        >
          <RotateCw className="h-4 w-4" />
          Reset deck
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentIndex === 0}
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

      <Card className="border-slate-200/60 bg-white text-slate-600 transition dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
        <CardContent className="flex items-center justify-between gap-3 p-4 text-sm">
          <p>
            Mastered <span className="font-semibold text-slate-900 dark:text-white">{known.length}</span> of{" "}
            <span className="font-semibold text-slate-900 dark:text-white">{flashcards.length}</span> cards
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
