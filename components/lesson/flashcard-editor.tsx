"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface Flashcard {
  id: string
  front: string
  back: string
  order_index: number
}

export default function FlashcardEditor({
  flashcard,
  onUpdate,
  onDelete,
}: {
  flashcard: Flashcard
  onUpdate: (updates: Partial<Flashcard>) => void
  onDelete: () => void
}) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor={`front-${flashcard.id}`}>Front (Question)</Label>
            <Textarea
              id={`front-${flashcard.id}`}
              value={flashcard.front}
              onChange={(e) => onUpdate({ front: e.target.value })}
              placeholder="Enter the question or term"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor={`back-${flashcard.id}`}>Back (Answer)</Label>
            <Textarea
              id={`back-${flashcard.id}`}
              value={flashcard.back}
              onChange={(e) => onUpdate({ back: e.target.value })}
              placeholder="Enter the answer or definition"
              className="mt-2"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={onDelete} variant="destructive" size="sm" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
