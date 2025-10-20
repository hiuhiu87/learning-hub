"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react"

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
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-600">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
        <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="group h-64 cursor-pointer perspective" onClick={() => setIsFlipped(!isFlipped)}>
        <div
          className={`relative h-full w-full transition-transform duration-500 transform-gpu ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <Card
            className="absolute h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg"
            style={{ backfaceVisibility: "hidden" }}
          >
            <CardContent className="flex h-full flex-col items-center justify-center p-8 text-center">
              <p className="text-sm font-medium opacity-75">Word</p>
              <p className="mt-4 text-4xl font-bold">{current.word}</p>
              <p className="mt-4 text-sm opacity-75">Click to reveal</p>
            </CardContent>
          </Card>

          {/* Back */}
          <Card
            className="absolute h-full w-full bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <CardContent className="flex h-full flex-col justify-center p-8">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-blue-600">Definition</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">{current.definition}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-blue-600">Example</p>
                  <p className="mt-2 italic text-gray-700">{current.example}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant={isKnown ? "default" : "outline"}
          onClick={toggleKnown}
          className={isKnown ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {isKnown ? "✓ Known" : "Mark as Known"}
        </Button>
        <Button variant="outline" onClick={handleReset} className="flex-1 bg-transparent">
          <RotateCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0} className="flex-1 bg-transparent">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-700">
            You know <span className="font-bold text-blue-600">{known.length}</span> out of{" "}
            <span className="font-bold text-blue-600">{flashcards.length}</span> cards
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
