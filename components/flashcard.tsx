"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    <Card className="h-64 cursor-pointer transition-all duration-300 hover:shadow-lg" onClick={handleFlip}>
      <CardContent className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-4 text-sm font-medium text-muted-foreground">{flipped ? "Answer" : "Question"}</p>
          <p className="text-2xl font-semibold text-foreground">{flipped ? back : front}</p>
          <p className="mt-6 text-xs text-muted-foreground">Click to flip</p>
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
      {title && <h2 className="text-2xl font-bold text-foreground">{title}</h2>}

      {/* Progress Bar */}
      <div>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted-foreground">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span className="font-semibold text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <Flashcard
        front={currentCard.front}
        back={currentCard.back}
        isFlipped={flipped}
        onFlip={() => setFlipped(!flipped)}
      />

      {/* Controls */}
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
          disabled={currentIndex === cards.length - 1}
          className="flex items-center gap-2 bg-transparent"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button variant={isMarked ? "default" : "outline"} size="sm" onClick={handleMark}>
          {isMarked ? "★ Marked" : "☆ Mark"}
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

      {/* Marked Cards Info */}
      {markedCount > 0 && (
        <div className="rounded-lg bg-accent/10 p-3 text-sm text-accent-foreground">
          {markedCount} card{markedCount !== 1 ? "s" : ""} marked for review
        </div>
      )}
    </div>
  )
}
