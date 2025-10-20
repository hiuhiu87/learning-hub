"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react"

interface Flashcard {
  id: string
  front: string
  back: string
  order_index: number
}

export default function FlashcardLearner({
  flashcards,
  onComplete,
}: {
  flashcards: Flashcard[]
  onComplete: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [markedCards, setMarkedCards] = useState<Set<string>>(new Set())

  const currentCard = flashcards[currentIndex]
  const isMarked = markedCards.has(currentCard.id)

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
    const newMarked = new Set(markedCards)
    if (isMarked) {
      newMarked.delete(currentCard.id)
    } else {
      newMarked.add(currentCard.id)
    }
    setMarkedCards(newMarked)
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setMarkedCards(new Set())
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
        />
      </div>

      {/* Card Counter */}
      <div className="text-center text-sm text-gray-600">
        Card {currentIndex + 1} of {flashcards.length}
      </div>

      {/* Flashcard */}
      <div onClick={() => setIsFlipped(!isFlipped)} className="cursor-pointer perspective h-64 md:h-80">
        <Card className="border-0 shadow-lg h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 hover:shadow-xl transition-shadow">
          <CardContent className="text-center p-8">
            <div className="text-white">
              <p className="text-sm font-medium opacity-75 mb-4">{isFlipped ? "Answer" : "Question"}</p>
              <p className="text-2xl md:text-3xl font-bold text-balance">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              <p className="text-sm opacity-50 mt-6">Click to flip</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center flex-wrap">
        <Button
          onClick={handleMark}
          variant={isMarked ? "default" : "outline"}
          className={isMarked ? "" : "bg-transparent"}
        >
          {isMarked ? "Marked" : "Mark for Review"}
        </Button>
        <Button onClick={handleReset} variant="outline" className="gap-2 bg-transparent">
          <RotateCw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
          className="flex-1 gap-2 bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button onClick={handleNext} disabled={currentIndex === flashcards.length - 1} className="flex-1 gap-2">
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Marked Cards Info */}
      {markedCards.size > 0 && (
        <Card className="border-0 shadow-md bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800">
              You have marked {markedCards.size} card{markedCards.size !== 1 ? "s" : ""} for review
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
