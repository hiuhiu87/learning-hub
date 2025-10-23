"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, History, Timer } from "lucide-react"
import FlashcardLearner from "./flashcard-learner"
import QuestionPractice from "./question-practice"
import type { LessonQuestion } from "@/types/lesson"

interface Lesson {
  id: string
  title: string
  description: string
  time_limit_minutes: number | null
}

interface Flashcard {
  id: string
  front: string
  back: string
  order_index: number
}

interface LessonAttempt {
  id: string
  student_id: string
  lesson_id: string
  correct_answers: number
  total_questions: number
  flashcards_reviewed: number
  created_at: string
  completed_at: string | null
}

export default function LessonLearner({
  lessonId,
  lesson,
  flashcards,
  questions,
  userId,
  previousAttempts,
}: {
  lessonId: string
  lesson: Lesson
  flashcards: Flashcard[]
  questions: LessonQuestion[]
  userId: string
  previousAttempts: LessonAttempt[]
}) {
  const supabase = createClient()
  const totalQuestions = questions.length
  const hasTimeLimit =
    typeof lesson.time_limit_minutes === "number" && lesson.time_limit_minutes > 0
  const timeLimitMinutes = hasTimeLimit ? (lesson.time_limit_minutes as number) : null
  const totalTimeSeconds =
    hasTimeLimit && timeLimitMinutes !== null ? timeLimitMinutes * 60 : null

  const [reviewedFlashcards, setReviewedFlashcards] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [attemptHistory, setAttemptHistory] = useState<LessonAttempt[]>(() => [...previousAttempts])
  const [currentAttempt, setCurrentAttempt] = useState<LessonAttempt | null>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({})
  const [isFlashcardOnly, setIsFlashcardOnly] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(totalTimeSeconds)
  const [isTimeExpired, setIsTimeExpired] = useState(false)
  const hasInitializedAttempt = useRef(false)
  const isAttemptCompleted = Boolean(currentAttempt?.completed_at)

  useEffect(() => {
    setReviewedFlashcards(0)
    setCorrectAnswers(0)
    setAttemptHistory([...previousAttempts])
    setCurrentAttempt(null)
    setAnsweredQuestions({})
    setIsFlashcardOnly(false)
    setRemainingSeconds(totalTimeSeconds)
    setIsTimeExpired(false)
    hasInitializedAttempt.current = false
  }, [lessonId, previousAttempts, totalTimeSeconds])

  useEffect(() => {
    if (isFlashcardOnly) return
    if (hasInitializedAttempt.current) return
    hasInitializedAttempt.current = true

    const startAttempt = async () => {
      const { data, error } = await supabase
        .from("lesson_attempts")
        .insert({
          student_id: userId,
          lesson_id: lessonId,
          total_questions: totalQuestions,
        })
        .select()
        .single()

      if (error) {
        console.error("Failed to start lesson attempt:", error)
        hasInitializedAttempt.current = false
        return
      }

      setCurrentAttempt(data)
    }

    void startAttempt()
  }, [isFlashcardOnly, lessonId, supabase, totalQuestions, userId])

  const updateAttempt = useCallback(
    async (patch: Partial<LessonAttempt>) => {
      if (!currentAttempt) return
      const attemptId = currentAttempt.id
      setCurrentAttempt((prev) => (prev ? { ...prev, ...patch } : prev))

      const { error } = await supabase.from("lesson_attempts").update(patch).eq("id", attemptId)
      if (error) {
        console.error("Failed to update lesson attempt:", error)
      }
    },
    [currentAttempt, supabase],
  )

  const handleMarkedChange = (count: number) => {
    setReviewedFlashcards(count)
    if (!currentAttempt || currentAttempt.completed_at) return
    void updateAttempt({ flashcards_reviewed: count })
  }

  const handleQuestionCorrect = async (questionId: string, answer: string, isCorrect: boolean) => {
    if (answeredQuestions[questionId]) {
      return
    }

    setAnsweredQuestions((prev) => ({ ...prev, [questionId]: isCorrect }))

    const newCorrectTotal = isCorrect ? correctAnswers + 1 : correctAnswers
    setCorrectAnswers(newCorrectTotal)

    const newAnsweredCount = Object.keys(answeredQuestions).length + 1
    const patch: Partial<LessonAttempt> = { correct_answers: newCorrectTotal }

    if (newAnsweredCount === totalQuestions && totalQuestions > 0) {
      patch.completed_at = new Date().toISOString()
      patch.flashcards_reviewed = reviewedFlashcards
    }

    if (currentAttempt) {
      await updateAttempt(patch)

      if (patch.completed_at) {
        const completedRecord: LessonAttempt = {
          ...currentAttempt,
          ...patch,
          correct_answers: patch.correct_answers ?? currentAttempt.correct_answers,
          flashcards_reviewed: patch.flashcards_reviewed ?? currentAttempt.flashcards_reviewed,
          completed_at: patch.completed_at,
        }

        setAttemptHistory((prev) => [completedRecord, ...prev])
        setCurrentAttempt(completedRecord)
      }
    }

    const { error } = await supabase.from("student_responses").insert({
      student_id: userId,
      lesson_id: lessonId,
      question_id: questionId,
      answer,
      is_correct: isCorrect,
    })

    if (error) {
      console.error("Failed to save student response:", error)
    }
  }

  const finalizeAttemptOnTimeout = useCallback(() => {
    const attempt = currentAttempt
    if (!attempt || attempt.completed_at) return

    const completionTimestamp = new Date().toISOString()
    const flashcardsReviewed = Math.max(reviewedFlashcards, attempt.flashcards_reviewed ?? 0)
    const patch: Partial<LessonAttempt> = {
      completed_at: completionTimestamp,
      correct_answers: attempt.correct_answers,
      flashcards_reviewed: flashcardsReviewed,
    }

    void updateAttempt(patch)

    const completedRecord: LessonAttempt = {
      ...attempt,
      ...patch,
      completed_at: completionTimestamp,
      correct_answers: patch.correct_answers ?? attempt.correct_answers,
      flashcards_reviewed: patch.flashcards_reviewed ?? attempt.flashcards_reviewed,
    }

    setAttemptHistory((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === attempt.id)
      if (existingIndex >= 0) {
        const next = [...prev]
        next[existingIndex] = completedRecord
        return next
      }
      return [completedRecord, ...prev]
    })
    setCurrentAttempt(completedRecord)
  }, [currentAttempt, reviewedFlashcards, updateAttempt])

  useEffect(() => {
    if (!hasTimeLimit || isFlashcardOnly || isTimeExpired || isAttemptCompleted) return
    if (remainingSeconds === null || remainingSeconds <= 0) return

    const interval = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return prev
        if (prev <= 1) {
          window.clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [hasTimeLimit, isAttemptCompleted, isFlashcardOnly, isTimeExpired, remainingSeconds])

  useEffect(() => {
    if (!hasTimeLimit || isAttemptCompleted) return
    if (remainingSeconds === null || remainingSeconds > 0) return
    if (isTimeExpired) return

    setIsTimeExpired(true)
    finalizeAttemptOnTimeout()
  }, [finalizeAttemptOnTimeout, hasTimeLimit, isAttemptCompleted, isTimeExpired, remainingSeconds])

  const completedAttempts = useMemo(
    () => attemptHistory.filter((attempt) => attempt.completed_at),
    [attemptHistory],
  )

  const attemptsToDisplay = useMemo(() => completedAttempts.slice(0, 5), [completedAttempts])
  const completedAttemptsCount = completedAttempts.length

  const attemptStatusLabel = useMemo(() => {
    if (!currentAttempt) return null
    if (currentAttempt.completed_at) {
      return `Latest attempt: #${completedAttemptsCount}`
    }
    return `Attempt in progress: #${attemptHistory.length + 1}`
  }, [attemptHistory.length, completedAttemptsCount, currentAttempt])

  const formatTimestamp = (isoDate: string | null) => {
    if (!isoDate) return "In progress"
    return new Date(isoDate).toLocaleString()
  }

  const scorePercent = (attempt: LessonAttempt) => {
    if (!attempt.total_questions) return null
    return Math.round((attempt.correct_answers / attempt.total_questions) * 100)
  }

  const formatDuration = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds)
    const minutes = Math.floor(safeSeconds / 60)
    const remaining = safeSeconds % 60
    const minutesLabel = minutes.toString().padStart(2, "0")
    const secondsLabel = remaining.toString().padStart(2, "0")
    return `${minutesLabel}:${secondsLabel}`
  }

  const timeRemainingLabel =
    hasTimeLimit && remainingSeconds !== null ? formatDuration(remainingSeconds) : null

  const timeStatusText = hasTimeLimit
    ? isTimeExpired
      ? "Time is up. Review your answers or restart later."
      : isAttemptCompleted
        ? "Attempt completed. You can review your work anytime."
        : isFlashcardOnly
          ? "Timer paused in flashcard-only mode."
          : "Complete the practice before the time runs out."
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
              <p className="text-gray-600">{lesson.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-2 md:items-end">
            {hasTimeLimit && timeLimitMinutes !== null && (
              <span className="text-sm text-gray-600">
                Time limit: {timeLimitMinutes} minute
                {timeLimitMinutes === 1 ? "" : "s"}
              </span>
            )}
            <div className="flex gap-2">
              <Button
                variant={isFlashcardOnly ? "outline" : "default"}
                className={isFlashcardOnly ? "bg-transparent" : ""}
                onClick={() => setIsFlashcardOnly(false)}
                disabled={!isFlashcardOnly}
              >
                Full Lesson
              </Button>
              <Button
                variant={isFlashcardOnly ? "default" : "outline"}
                className={!isFlashcardOnly ? "bg-transparent" : ""}
                onClick={() => setIsFlashcardOnly(true)}
                disabled={isFlashcardOnly}
              >
                Flashcards Only
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Flashcards Reviewed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reviewedFlashcards}/{flashcards.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Correct Answers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {correctAnswers}/{totalQuestions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <History className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Completed Attempts</p>
                  <p className="text-2xl font-bold text-gray-900">{completedAttemptsCount}</p>
                </div>
              </div>
              {attemptStatusLabel && (
                <p className="mt-3 text-sm text-gray-600">{attemptStatusLabel}</p>
              )}
            </CardContent>
          </Card>
          {hasTimeLimit && (
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Timer className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Time Remaining</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isFlashcardOnly
                        ? timeRemainingLabel ?? "Paused"
                        : timeRemainingLabel ?? (isTimeExpired ? "00:00" : "—")}
                    </p>
                  </div>
                </div>
                {timeStatusText && (
                  <p className="mt-3 text-sm text-gray-600">{timeStatusText}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Attempt History */}
        <Card className="mb-8 border-0 shadow-md">
          <CardHeader>
            <CardTitle>Attempt History</CardTitle>
          </CardHeader>
          <CardContent>
            {attemptsToDisplay.length === 0 ? (
              <p className="text-sm text-gray-600">
                No completed attempts yet. Finish the practice questions to start tracking your
                progress.
              </p>
            ) : (
              <ul className="space-y-4">
                {attemptsToDisplay.map((attempt, index) => {
                  const attemptNumber = completedAttemptsCount - index
                  const percent = scorePercent(attempt)
                  const previousAttempt = attemptsToDisplay[index + 1]
                  const flashcardsReviewed = attempt.flashcards_reviewed ?? 0
                  let deltaLabel: string | null = null

                  if (previousAttempt) {
                    const prevPercent = scorePercent(previousAttempt)
                    if (percent !== null && prevPercent !== null) {
                      const delta = percent - prevPercent
                      if (delta !== 0) {
                        deltaLabel = `${delta > 0 ? "+" : ""}${delta}% vs previous`
                      }
                    }
                  }

                  return (
                    <li
                      key={attempt.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-semibold text-gray-900">Attempt #{attemptNumber}</span>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(attempt.completed_at ?? attempt.created_at)}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-700">
                        <span>
                          {attempt.total_questions > 0
                            ? `Score: ${attempt.correct_answers}/${attempt.total_questions}${
                                percent !== null ? ` (${percent}%)` : ""
                              }`
                            : "No practice questions recorded"}
                        </span>
                        <span>Flashcards reviewed: {flashcardsReviewed}</span>
                        {deltaLabel && (
                          <span className={deltaLabel.includes("+") ? "text-green-600" : "text-red-600"}>
                            {deltaLabel}
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Learning Content */}
        {isFlashcardOnly ? (
          <div className="mb-8 space-y-4">
            <Card className="border-0 shadow-md bg-blue-50">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-800">
                  Flashcard-only mode is active. Practice questions and lesson timers are hidden.
                </p>
              </CardContent>
            </Card>
            {flashcards.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No flashcards in this lesson yet.</p>
                </CardContent>
              </Card>
            ) : (
              <FlashcardLearner flashcards={flashcards} onMarkedChange={handleMarkedChange} />
            )}
          </div>
        ) : (
          <Tabs defaultValue="flashcards" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="flashcards">Flashcards ({flashcards.length})</TabsTrigger>
              <TabsTrigger value="practice">Practice Questions ({totalQuestions})</TabsTrigger>
            </TabsList>

            <TabsContent value="flashcards">
              {flashcards.length === 0 ? (
                <Card className="border-0 shadow-md">
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600">No flashcards in this lesson yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <FlashcardLearner flashcards={flashcards} onMarkedChange={handleMarkedChange} />
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
                <QuestionPractice
                  questions={questions}
                  onAnswerQuestion={handleQuestionCorrect}
                  isLocked={isTimeExpired}
                  lockMessage={
                    isTimeExpired
                      ? "Time is up. You can review the questions, but new answers won't be recorded."
                      : undefined
                  }
                />
              )}
            </TabsContent>
          </Tabs>
        )}

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
