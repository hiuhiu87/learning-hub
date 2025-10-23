"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"

interface Flashcard {
  id: string
  front: string
  back: string
  order_index: number
}

export default function FlashcardEditor({
  index,
  flashcard,
  onUpdate,
  onDelete,
}: {
  index?: number
  flashcard: Flashcard
  onUpdate: (updates: Partial<Flashcard>) => void
  onDelete: () => void
}) {
  const fieldClass =
    "mt-2 border-slate-200/60 bg-white text-slate-700 placeholder:text-slate-400 focus-visible:border-sky-400/60 focus-visible:ring-sky-400/40 dark:border-white/15 dark:bg-slate-950/60 dark:text-slate-100"

  return (
    <Card className="border-slate-200/60 bg-white/80 text-slate-900 shadow-2xl backdrop-blur transition dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
        <div className="space-y-1">
          <Badge variant="secondary" className="border-slate-200/60 bg-white text-slate-700 transition dark:border-white/10 dark:bg-white/10 dark:text-white">
            Flashcard {index != null ? `#${index}` : ""}
          </Badge>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Prompt & Response</CardTitle>
        </div>
        <Button
          onClick={onDelete}
          variant="ghost"
          size="sm"
          className="gap-2 border border-slate-200/60 bg-white text-red-500 hover:bg-red-100 dark:border-white/10 dark:bg-white/5 dark:text-red-200 dark:hover:bg-red-500/20 dark:hover:text-red-100"
        >
          <Trash2 className="h-4 w-4" />
          Remove
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <div className="space-y-2">
          <Label htmlFor={`front-${flashcard.id}`} className="text-sm text-slate-600 dark:text-slate-300">
            Front (Question)
          </Label>
          <Textarea
            id={`front-${flashcard.id}`}
            value={flashcard.front}
            onChange={(e) => onUpdate({ front: e.target.value })}
            placeholder="Introduce a concept, question, or scenario for learners to recall."
            className={fieldClass}
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`back-${flashcard.id}`} className="text-sm text-slate-600 dark:text-slate-300">
            Back (Answer)
          </Label>
          <Textarea
            id={`back-${flashcard.id}`}
            value={flashcard.back}
            onChange={(e) => onUpdate({ back: e.target.value })}
            placeholder="Provide the ideal answer, key facts, or hint learners should retain."
            className={fieldClass}
            rows={4}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <p className="font-medium uppercase tracking-[0.25em] text-slate-500 dark:text-slate-500">Display order</p>
            <p className="text-sm text-slate-600 dark:text-slate-200">Position {flashcard.order_index + 1}</p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep prompts clear, concise, and aligned with the skill your learners should master.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
