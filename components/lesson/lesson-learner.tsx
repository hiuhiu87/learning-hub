"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import FlashcardLearner from "./flashcard-learner"
import QuestionPractice from "./question-practice"
import type { LessonQuestion } from "@/types/lesson"

interface Lesson {
  id: string
  title: string
  description: string
}

interface Flashcard {
  id: string
  front: string
  back: string
  order_index: number
}

export default function LessonLearner({
  lessonId,
  lesson,
  flashcards,
  questions,
  userId,
}: {
  lessonId: string
  lesson: Lesson
  flashcards: Flashcard[]
  questions: LessonQuestion[]
  userId: string
}) {
  const [completedFlashcards, setCompletedFlashcards] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const supabase = createClient()

  const handleFlashcardComplete = () => {
    setCompletedFlashcards((prev) => prev + 1)
  }

  const handleQuestionCorrect = async (questionId: string, answer: string, isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1)
    }

    // Save response to database
    await supabase.from("student_responses").insert({
      student_id: userId,
      lesson_id: lessonId,
      question_id: questionId,
      answer,
      is_correct: isCorrect,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
              <p className="text-gray-600">{lesson.description}</p>
            </div>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Flashcards Reviewed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedFlashcards}/{flashcards.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Correct Answers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {correctAnswers}/{questions.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Tabs */}
        <Tabs defaultValue="flashcards" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="flashcards">Flashcards ({flashcards.length})</TabsTrigger>
            <TabsTrigger value="practice">Practice Questions ({questions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="flashcards">
            {flashcards.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No flashcards in this lesson yet.</p>
                </CardContent>
              </Card>
            ) : (
              <FlashcardLearner flashcards={flashcards} onComplete={handleFlashcardComplete} />
            )}
          </TabsContent>

          <TabsContent value="practice">
            {questions.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No practice questions in this lesson yet.</p>
                </CardContent>
              </Card>
            ) : (
              <QuestionPractice questions={questions} onAnswerQuestion={handleQuestionCorrect} />
            )}
          </TabsContent>
        </Tabs>

        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="outline" className="w-full bg-transparent">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
