export type QuestionType = "multiple-choice" | "yes-no-not-given"

export interface LessonQuestion {
  id: string
  question_text: string
  question_type: QuestionType
  correct_answer: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  explanation: string
  order_index: number
}
