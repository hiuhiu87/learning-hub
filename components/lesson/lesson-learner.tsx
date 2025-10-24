"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, CheckCircle2, History, ListChecks, Timer } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import QuestionPractice from "./question-practice"
import type { LessonQuestion } from "@/types/lesson"

interface Lesson {
  id: string
  title: string
  description: string
  time_limit_minutes: number | null
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

interface LessonLearnerProps {
  lessonId: string
  lesson: Lesson
  questions: LessonQuestion[]
  userId: string
  previousAttempts: LessonAttempt[]
  flashcardCount: number
}

export default function LessonLearner({
  lessonId,
  lesson,
  questions,
  userId,
  previousAttempts,
  flashcardCount,
}: LessonLearnerProps) {
  const supabase = createClient()
  const totalQuestions = questions.length
  const hasTimeLimit =
    typeof lesson.time_limit_minutes === "number" && lesson.time_limit_minutes > 0
  const timeLimitMinutes = hasTimeLimit ? (lesson.time_limit_minutes as number) : null
  const totalTimeSeconds =
    hasTimeLimit && timeLimitMinutes !== null ? timeLimitMinutes * 60 : null

  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [attemptHistory, setAttemptHistory] = useState<LessonAttempt[]>(() => [...previousAttempts])
  const [currentAttempt, setCurrentAttempt] = useState<LessonAttempt | null>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({})
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(totalTimeSeconds)
  const [isTimeExpired, setIsTimeExpired] = useState(false)
  const hasInitializedAttempt = useRef(false)
  const isAttemptCompleted = Boolean(currentAttempt?.completed_at)

  useEffect(() => {
    setCorrectAnswers(0)
    setAttemptHistory([...previousAttempts])
    setCurrentAttempt(null)
    setAnsweredQuestions({})
    setRemainingSeconds(totalTimeSeconds)
    setIsTimeExpired(false)
    hasInitializedAttempt.current = false
  }, [lessonId, previousAttempts, totalTimeSeconds])

  useEffect(() => {
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
  }, [lessonId, supabase, totalQuestions, userId])

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
    }

    if (currentAttempt) {
      await updateAttempt(patch)

      if (patch.completed_at) {
        const completedRecord: LessonAttempt = {
          ...currentAttempt,
          ...patch,
          correct_answers: patch.correct_answers ?? currentAttempt.correct_answers,
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
    const patch: Partial<LessonAttempt> = {
      completed_at: completionTimestamp,
      correct_answers: attempt.correct_answers,
    }

    void updateAttempt(patch)

    const completedRecord: LessonAttempt = {
      ...attempt,
      ...patch,
      completed_at: completionTimestamp,
      correct_answers: patch.correct_answers ?? attempt.correct_answers,
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
  }, [currentAttempt, updateAttempt])

  useEffect(() => {
    if (!hasTimeLimit || isTimeExpired || isAttemptCompleted) return
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
  }, [hasTimeLimit, isAttemptCompleted, isTimeExpired, remainingSeconds])

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
        : "Complete the practice before the time runs out."
    : null

  const answeredCount = useMemo(
    () => Object.keys(answeredQuestions).length,
    [answeredQuestions],
  )

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-slate-950 to-slate-950" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:26px_26px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 md:px-10">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4 md:items-center">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="border border-white/10 bg-white/10 text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Practice session</p>
              <h1 className="mt-1 text-3xl font-semibold text-white">{lesson.title}</h1>
              <p className="mt-2 text-sm text-slate-300">
                {lesson.description ||
                  "Work through the practice set and track your progress over time."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            {hasTimeLimit && timeLimitMinutes !== null && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100">
                <Timer className="h-4 w-4" />
                {timeLimitMinutes} minute{timeLimitMinutes === 1 ? "" : "s"} limit
              </span>
            )}
            {flashcardCount > 0 ? (
              <Link href={`/lesson/${lessonId}/flashcards`}>
                <Button className="gap-2 border border-emerald-400/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20">
                  <BookOpen className="h-4 w-4" />
                  Review flashcards
                </Button>
              </Link>
            ) : (
              <Button
                disabled
                className="gap-2 border border-white/10 bg-white/5 text-slate-400"
              >
                <BookOpen className="h-4 w-4" />
                No flashcards yet
              </Button>
            )}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-white/10 bg-slate-950/60 text-slate-100 shadow-2xl backdrop-blur">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/15 text-sky-100">
                  <ListChecks className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Questions answered</p>
                  <p className="text-2xl font-semibold text-white">
                    {answeredCount}/{totalQuestions || 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Aim to complete every question to unlock a full attempt summary.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/60 text-slate-100 shadow-2xl backdrop-blur">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-200">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Correct answers</p>
                  <p className="text-2xl font-semibold text-white">
                    {correctAnswers}/{totalQuestions || 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Reflect on each result to reinforce what worked and what needs review.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/60 text-slate-100 shadow-2xl backdrop-blur">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-400/15 text-violet-100">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Completed attempts</p>
                  <p className="text-2xl font-semibold text-white">{completedAttemptsCount}</p>
                </div>
              </div>
              {attemptStatusLabel && <p className="text-xs text-slate-400">{attemptStatusLabel}</p>}
            </CardContent>
          </Card>

          {hasTimeLimit && (
            <Card className="border-white/10 bg-slate-950/60 text-slate-100 shadow-2xl backdrop-blur">
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/15 text-amber-100">
                    <Timer className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Time remaining</p>
                    <p className="text-2xl font-semibold text-white">
                      {timeRemainingLabel ?? (isTimeExpired ? "00:00" : "—")}
                    </p>
                  </div>
                </div>
                {timeStatusText && <p className="text-xs text-slate-400">{timeStatusText}</p>}
              </CardContent>
            </Card>
          )}
        </section>

        <Card className="border-white/10 bg-slate-950/60 text-slate-100 shadow-2xl backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">Attempt history</CardTitle>
          </CardHeader>
          <CardContent>
            {attemptsToDisplay.length === 0 ? (
              <p className="text-sm text-slate-300">
                Finish the practice set to start tracking your progress over time.
              </p>
            ) : (
              <ul className="space-y-4">
                {attemptsToDisplay.map((attempt, index) => {
                  const attemptNumber = completedAttemptsCount - index
                  const percent = scorePercent(attempt)
                  const previousAttempt = attemptsToDisplay[index + 1]
                  let deltaLabel: string | null = null

                  if (previousAttempt) {
                    const prevPercent = scorePercent(previousAttempt)
                    if (percent !== null && prevPercent !== null) {
                      const delta = percent - prevPercent
                      if (delta !== 0) {
                        deltaLabel = `${delta > 0 ? "+" : ""}${delta}% compared to last time`
                      }
                    }
                  }

                  return (
                    <li
                      key={attempt.id}
                      className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-base font-semibold text-white">Attempt #{attemptNumber}</span>
                        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          {formatTimestamp(attempt.completed_at ?? attempt.created_at)}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4">
                        <span>
                          {attempt.total_questions > 0
                            ? `Score: ${attempt.correct_answers}/${attempt.total_questions}${
                                percent !== null ? ` (${percent}%)` : ""
                              }`
                            : "No practice questions recorded"}
                        </span>
                        {deltaLabel && (
                          <span className={deltaLabel.startsWith("+") ? "text-emerald-300" : "text-rose-300"}>
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

        <Card className="border-white/10 bg-slate-950/60 text-slate-100 shadow-2xl backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">Practice questions</CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <Card className="border-white/10 bg-white/5 text-slate-200">
                <CardContent className="py-12 text-center text-sm">
                  Practice questions are coming soon.
                </CardContent>
              </Card>
            ) : (
              <QuestionPractice
                questions={questions}
                onAnswerQuestion={handleQuestionCorrect}
                isLocked={isTimeExpired}
                lockMessage={
                  isTimeExpired
                    ? "Time is up. You can review the questions, but new answers will not be recorded."
                    : undefined
                }
              />
            )}
          </CardContent>
        </Card>

        <footer className="flex justify-end">
          <Link href="/dashboard">
            <Button className="gap-2 border border-white/10 bg-white/10 text-slate-100 hover:bg-white/20">
              Back to dashboard
            </Button>
          </Link>
        </footer>
      </div>
    </div>
  )
}
