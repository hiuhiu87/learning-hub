"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import type { LessonQuestion, QuestionType } from "@/types/lesson"

type OptionKey = "A" | "B" | "C" | "D"

const YES_NO_OPTIONS = [
  { key: "A", label: "Yes" },
  { key: "B", label: "No" },
  { key: "C", label: "Not Given" },
] as const

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  "multiple-choice": "Multiple Choice",
  "yes-no-not-given": "Yes / No / Not Given",
}

export default function QuestionEditor({
  index,
  question,
  onUpdate,
  onDelete,
}: {
  index?: number
  question: LessonQuestion
  onUpdate: (updates: Partial<LessonQuestion>) => void
  onDelete: () => void
}) {
  const isYesNo = question.question_type === "yes-no-not-given"

  const optionEntries: Array<{ key: OptionKey; value: string }> = [
    { key: "A", value: question.option_a },
    { key: "B", value: question.option_b },
    { key: "C", value: question.option_c },
    { key: "D", value: question.option_d },
  ]

  const selectOptions = isYesNo
    ? YES_NO_OPTIONS.map(({ key, label }) => ({
        key,
        label: optionEntries
          .find((entry) => entry.key === key)
          ?.value?.trim() || label,
      }))
    : optionEntries.map(({ key, value }) => ({
        key,
        label: value?.trim() ? value : `Option ${key}`,
      }))

  const handleTypeChange = (value: string) => {
    const nextType = value as QuestionType
    if (nextType === question.question_type) return

    if (nextType === "yes-no-not-given") {
      onUpdate({
        question_type: nextType,
        option_a: YES_NO_OPTIONS[0].label,
        option_b: YES_NO_OPTIONS[1].label,
        option_c: YES_NO_OPTIONS[2].label,
        option_d: "",
        correct_answer: ["A", "B", "C"].includes(question.correct_answer) ? question.correct_answer : "A",
      })
      return
    }

    onUpdate({ question_type: nextType })
  }

  const handleCorrectAnswerChange = (value: string) => {
    onUpdate({ correct_answer: value })
  }

  const handleOptionChange = (key: OptionKey, value: string) => {
    const field = `option_${key.toLowerCase()}` as keyof LessonQuestion
    onUpdate({ [field]: value } as Partial<LessonQuestion>)
  }

  const fieldClass =
    "mt-2 border-slate-200/60 bg-white text-slate-700 placeholder:text-slate-400 focus-visible:border-sky-400/60 focus-visible:ring-sky-400/40 dark:border-white/15 dark:bg-slate-950/60 dark:text-slate-100"

  return (
    <Card className="border-slate-200/60 bg-white/80 text-slate-900 shadow-2xl backdrop-blur transition dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
        <div className="space-y-1">
          <Badge variant="secondary" className="border-slate-200/60 bg-white text-slate-700 transition dark:border-white/10 dark:bg-white/10 dark:text-white">
            Question {index != null ? `#${index}` : ""}
          </Badge>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Assessment Item</CardTitle>
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
          <Label htmlFor={`question-type-${question.id}`} className="text-sm text-slate-600 dark:text-slate-300">
            Question Type
          </Label>
          <Select value={question.question_type} onValueChange={handleTypeChange}>
            <SelectTrigger id={`question-type-${question.id}`} className={fieldClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border border-slate-200/60 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100">
              {Object.entries(QUESTION_TYPE_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value} className="focus:bg-slate-100 dark:focus:bg-slate-800">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`question-${question.id}`} className="text-sm text-slate-600 dark:text-slate-300">
            Question Prompt
          </Label>
          <Textarea
            id={`question-${question.id}`}
            value={question.question_text}
            onChange={(e) => onUpdate({ question_text: e.target.value })}
            placeholder="Ask a clear, outcome-aligned question learners can reason through."
            className={fieldClass}
            rows={4}
          />
        </div>

        {isYesNo ? (
          <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 text-sm text-slate-600 transition dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            Answer choices are fixed to Yes / No / Not Given for this format. Use the explanation below to reinforce what
            great reasoning looks like.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {optionEntries.map(({ key, value }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`option-${key.toLowerCase()}-${question.id}`} className="text-sm text-slate-600 dark:text-slate-300">
                  Option {key}
                </Label>
                <Input
                  id={`option-${key.toLowerCase()}-${question.id}`}
                  value={value}
                  onChange={(e) => handleOptionChange(key, e.target.value)}
                  placeholder={`Response choice ${key}`}
                  className={fieldClass}
                />
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`correct-${question.id}`} className="text-sm text-slate-600 dark:text-slate-300">
            Correct Answer
          </Label>
          <Select value={question.correct_answer} onValueChange={handleCorrectAnswerChange}>
            <SelectTrigger id={`correct-${question.id}`} className={fieldClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border border-slate-200/60 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100">
              {selectOptions.map(({ key, label }) => (
                <SelectItem key={key} value={key} className="focus:bg-slate-100 dark:focus:bg-slate-800">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`explanation-${question.id}`} className="text-sm text-slate-600 dark:text-slate-300">
            Explanation (optional)
          </Label>
          <Textarea
            id={`explanation-${question.id}`}
            value={question.explanation}
            onChange={(e) => onUpdate({ explanation: e.target.value })}
            placeholder="Offer coaching feedback that celebrates the right approach and clarifies misconceptions."
            className={fieldClass}
            rows={3}
          />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Blend recall and application-focused questions. The right mix keeps sessions challenging yet approachable.
        </p>
      </CardContent>
    </Card>
  )
}
