"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  question,
  onUpdate,
  onDelete,
}: {
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

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor={`question-type-${question.id}`}>Question Type</Label>
            <Select value={question.question_type} onValueChange={handleTypeChange}>
              <SelectTrigger id={`question-type-${question.id}`} className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(QUESTION_TYPE_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`question-${question.id}`}>Question</Label>
            <Textarea
              id={`question-${question.id}`}
              value={question.question_text}
              onChange={(e) => onUpdate({ question_text: e.target.value })}
              placeholder="Enter the question"
              className="mt-2"
            />
          </div>

          {isYesNo ? (
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              Answer choices are fixed to Yes / No / Not Given for this question type. Choose the correct option below.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {optionEntries.map(({ key, value }) => (
                <div key={key}>
                  <Label htmlFor={`option-${key.toLowerCase()}-${question.id}`}>Option {key}</Label>
                  <Input
                    id={`option-${key.toLowerCase()}-${question.id}`}
                    value={value}
                    onChange={(e) => handleOptionChange(key, e.target.value)}
                    placeholder={`Option ${key}`}
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <Label htmlFor={`correct-${question.id}`}>Correct Answer</Label>
            <Select value={question.correct_answer} onValueChange={handleCorrectAnswerChange}>
              <SelectTrigger id={`correct-${question.id}`} className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {selectOptions.map(({ key, label }) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`explanation-${question.id}`}>Explanation (Optional)</Label>
            <Textarea
              id={`explanation-${question.id}`}
              value={question.explanation}
              onChange={(e) => onUpdate({ explanation: e.target.value })}
              placeholder="Explain why this is the correct answer"
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
