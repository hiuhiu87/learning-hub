"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react"

interface FlashcardProps {
  front: string
  back: string
  isFlipped?: boolean
  onFlip?: () => void
}

export function Flashcard({ front, back, isFlipped = false, onFlip }: FlashcardProps) {
  const [flipped, setFlipped] = useState(isFlipped)

  const handleFlip = () => {
    setFlipped(!flipped)
    onFlip?.()
  }

  return (
    <Card
      className="relative h-64 cursor-pointer overflow-hidden border border-white/10 bg-gradient-to-br from-sky-600/40 via-indigo-700/60 to-slate-900/70 text-white shadow-2xl transition-all duration-300 hover:shadow-[0_20px_45px_rgba(56,189,248,0.25)]"
      onClick={handleFlip}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_top,_rgba(255,255,255,0.18),transparent_60%)]" />
      <CardContent className="relative flex h-full items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-white/70">
            {flipped ? "Answer" : "Prompt"}
          </p>
          <p className="text-2xl font-semibold text-white">{flipped ? back : front}</p>
          <p className="mt-6 text-xs text-white/60">Tap to flip</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface FlashcardLearnerProps {
  cards: Array<{ id: string; front: string; back: string }>
  title?: string
}

export function FlashcardLearner({ cards, title }: FlashcardLearnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [markedMap, setMarkedMap] = useState<Record<string, boolean>>({})

  const currentCard = cards[currentIndex]
  const progress = ((currentIndex + 1) / cards.length) * 100
  const markedCount = Object.keys(markedMap).length
  const isMarked = Boolean(markedMap[currentCard.id])

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setFlipped(false)
    }
  }

  const handleMark = () => {
    setMarkedMap((prev) => {
      const next = { ...prev }
      if (next[currentCard.id]) {
        delete next[currentCard.id]
      } else {
        next[currentCard.id] = true
      }
      return next
    })
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setFlipped(false)
    setMarkedMap({})
  }

  return (
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-semibold text-white">{title}</h2>}

      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="border-white/10 bg-white/10 text-white">
          Flashcard carousel
        </Badge>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-400 to-indigo-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Flashcard front={currentCard.front} back={currentCard.back} isFlipped={flipped} onFlip={() => setFlipped(!flipped)} />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
          disabled={currentIndex === cards.length - 1}
          className="flex items-center gap-2 bg-sky-500 text-white hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-300"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          onClick={handleMark}
          className={`flex items-center gap-2 border border-white/10 ${
            isMarked ? "bg-emerald-500/80 text-white hover:bg-emerald-400" : "bg-white/5 text-slate-100 hover:bg-white/15"
          }`}
        >
          {isMarked ? "★ Marked" : "☆ Mark"}
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

      {markedCount > 0 && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          {markedCount} card{markedCount !== 1 ? "s" : ""} marked for review
        </div>
      )}
    </div>
  )
}
