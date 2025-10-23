"use client"

import type React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  BarChart3,
  XCircle,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Enrollment {
  student_id: string
}

interface Response {
  student_id: string
  question_id: string
  is_correct: boolean | null
  answer: string | null
  created_at?: string
}

interface Lesson {
  id: string
  title: string
  description: string
  time_limit_minutes: number | null
}

interface Question {
  id: string
  question_text: string
  question_type: string
  correct_answer: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  explanation?: string | null
}

interface StudentProfile {
  id: string
  full_name: string | null
  email: string | null
}

type StudentSummary = {
  studentId: string
  profile?: StudentProfile
  correct: number
  attempts: number
  score: number
  responses: Map<string, Response>
}

export default function LessonAnalytics({
  lesson,
  enrollments,
  responses,
  questions,
  students,
}: {
  lesson: Lesson
  enrollments: Enrollment[]
  responses: Response[]
  questions: Question[]
  students: StudentProfile[]
}) {
  const questionMap = new Map(questions.map((question) => [question.id, question]))
  const studentProfiles = new Map(students.map((student) => [student.id, student]))

  const responsesByStudent = new Map<string, Map<string, Response>>()
  responses.forEach((response) => {
    const existing = responsesByStudent.get(response.student_id) || new Map<string, Response>()
    existing.set(response.question_id, response)
    responsesByStudent.set(response.student_id, existing)
  })

  const studentIds = Array.from(
    new Set([
      ...enrollments.map((enrollment) => enrollment.student_id),
      ...responses.map((response) => response.student_id),
    ]),
  )

  const totalQuestions = questions.length

  const studentSummaries: StudentSummary[] = studentIds.map((studentId) => {
    const studentResponses = responsesByStudent.get(studentId) || new Map<string, Response>()
    let correct = 0
    studentResponses.forEach((response) => {
      if (response.is_correct) {
        correct += 1
      }
    })

    const score = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0

    return {
      studentId,
      profile: studentProfiles.get(studentId),
      correct,
      attempts: studentResponses.size,
      score,
      responses: studentResponses,
    }
  })

  studentSummaries.sort((a, b) => {
    const nameA = getStudentDisplayName(a).toLowerCase()
    const nameB = getStudentDisplayName(b).toLowerCase()
    return nameA.localeCompare(nameB)
  })

  const totalStudents = studentSummaries.length
  const totalResponses = responses.length
  const correctResponses = responses.filter((r) => r.is_correct).length
  const averageScore =
    studentSummaries.length > 0
      ? Math.round(studentSummaries.reduce((sum, summary) => sum + summary.score, 0) / studentSummaries.length)
      : 0

  const questionResponses = new Map<string, Response[]>()
  responses.forEach((response) => {
    const list = questionResponses.get(response.question_id) ?? []
    list.push(response)
    questionResponses.set(response.question_id, list)
  })

  const questionInsights = questions.map((question) => {
    const questionResponseList = questionResponses.get(question.id) ?? []
    const correctCount = questionResponseList.filter((response) => response.is_correct).length
    const incorrectCount = questionResponseList.length - correctCount
    const accuracy = questionResponseList.length
      ? Math.round((correctCount / questionResponseList.length) * 100)
      : null

    return {
      question,
      responses: questionResponseList,
      correctCount,
      incorrectCount,
      accuracy,
    }
  })

  const strongestQuestion = questionInsights
    .filter((item) => item.responses.length > 0)
    .reduce<typeof questionInsights[number] | null>((best, current) => {
      if (!best) return current
      if ((current.accuracy ?? 0) > (best.accuracy ?? 0)) return current
      return best
    }, null)

  const weakestQuestion = questionInsights
    .filter((item) => item.responses.length > 0)
    .reduce<typeof questionInsights[number] | null>((worst, current) => {
      if (!worst) return current
      if ((current.accuracy ?? 100) < (worst.accuracy ?? 100)) return current
      return worst
    }, null)

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-600/20 via-slate-950 to-slate-950" />
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
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Lesson analytics</p>
              <h1 className="mt-1 text-3xl font-semibold text-white">{lesson.title}</h1>
              <p className="mt-2 text-sm text-slate-300">
                Understand engagement, celebrate wins, and spot opportunities to improve this journey.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {lesson.time_limit_minutes != null ? (
              <Badge variant="secondary" className="border-white/10 bg-white/10 text-white">
                Time limit: {lesson.time_limit_minutes} minute{lesson.time_limit_minutes === 1 ? "" : "s"}
              </Badge>
            ) : (
              <Badge variant="secondary" className="border-white/10 bg-white/10 text-white">
                Self-paced lesson
              </Badge>
            )}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Users className="h-6 w-6" />}
            iconClass="border-sky-400/30 bg-sky-500/10 text-sky-100"
            label="Active learners"
            value={totalStudents}
            helper="Enrolled students who interacted with this lesson."
          />
          <StatCard
            icon={<CheckCircle2 className="h-6 w-6" />}
            iconClass="border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
            label="Correct responses"
            value={correctResponses}
            helper={`${totalResponses || 0} total responses`}
          />
          <StatCard
            icon={<BarChart3 className="h-6 w-6" />}
            iconClass="border-violet-400/30 bg-violet-500/10 text-violet-100"
            label="Average score"
            value={`${averageScore}%`}
            helper="Across the latest attempts per student."
          />
          <StatCard
            icon={<XCircle className="h-6 w-6" />}
            iconClass="border-rose-400/30 bg-rose-500/10 text-rose-100"
            label="Needs review"
            value={totalResponses - correctResponses}
            helper="Responses recorded as incorrect."
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-white/10 bg-slate-950/60 text-slate-100 shadow-2xl backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">Learner performance</CardTitle>
              <CardDescription className="text-sm text-slate-300">
                Track how each student performed and how many prompts they attempted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentSummaries.length === 0 ? (
                <p className="text-sm text-slate-300">No learner activity yet. Share the lesson to get started.</p>
              ) : (
                <Table className="text-sm">
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-slate-200">Learner</TableHead>
                      <TableHead className="text-slate-200">Email</TableHead>
                      <TableHead className="text-slate-200">Attempts</TableHead>
                      <TableHead className="text-slate-200">Correct</TableHead>
                      <TableHead className="text-right text-slate-200">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentSummaries.map((summary) => (
                      <TableRow key={summary.studentId} className="border-white/5 hover:bg-white/5">
                        <TableCell className="text-slate-100">{getStudentDisplayName(summary)}</TableCell>
                        <TableCell className="text-slate-400">{getStudentEmail(summary) ?? "—"}</TableCell>
                        <TableCell className="text-slate-300">{summary.attempts}</TableCell>
                        <TableCell className="text-slate-300">{summary.correct}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="secondary"
                            className={`border-white/10 bg-white/10 ${summary.score >= 70 ? "text-emerald-100" : "text-amber-100"}`}
                          >
                            {summary.score}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/60 text-slate-100 shadow-2xl backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">Insight highlights</CardTitle>
              <CardDescription className="text-sm text-slate-300">
                Celebrate wins and identify follow-up opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InsightBlock
                icon={<Sparkles className="h-5 w-5" />}
                title="Lesson summary"
                description={`${totalResponses || 0} responses across ${totalStudents} learners`}
              />
              {strongestQuestion ? (
                <InsightBlock
                  icon={<TrendingUp className="h-5 w-5" />}
                  title="Strongest question"
                  description={`“${strongestQuestion.question.question_text}” — ${strongestQuestion.accuracy}% accuracy`}
                />
              ) : (
                <InsightBlock
                  icon={<TrendingUp className="h-5 w-5" />}
                  title="Strongest question"
                  description="Not enough responses yet to highlight strengths."
                />
              )}
              {weakestQuestion ? (
                <InsightBlock
                  icon={<AlertTriangle className="h-5 w-5" />}
                  title="Needs support"
                  description={`“${weakestQuestion.question.question_text}” — ${weakestQuestion.accuracy}% accuracy`}
                />
              ) : (
                <InsightBlock
                  icon={<AlertTriangle className="h-5 w-5" />}
                  title="Needs support"
                  description="Once learners attempt more questions, we’ll surface them here."
                />
              )}
            </CardContent>
          </Card>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-white">Question breakdown</h2>
            <p className="text-sm text-slate-300">
              Drill into each prompt to understand misconceptions and adjust next steps.
            </p>
          </div>
          <Accordion type="single" collapsible className="mt-6 space-y-3">
            {questionInsights.map(({ question, responses: questionResponsesList, correctCount, incorrectCount, accuracy }) => {
              const total = questionResponsesList.length
              const accuracyLabel =
                accuracy === null ? "Awaiting data" : `${accuracy}% accuracy (${correctCount}/${total})`

              return (
                <AccordionItem
                  key={question.id}
                  value={question.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 text-slate-100"
                >
                  <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-white hover:bg-white/5">
                    <div className="flex flex-col gap-1">
                      <span>{question.question_text}</span>
                      <span className="text-xs text-slate-400">{accuracyLabel}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 px-5 pb-5 text-sm text-slate-200">
                    <div className="flex flex-wrap gap-3 text-xs">
                      <Badge variant="secondary" className="border-white/10 bg-white/10 text-slate-100">
                        {formatQuestionType(question.question_type)}
                      </Badge>
                      <Badge variant="secondary" className="border-emerald-400/40 bg-emerald-500/10 text-emerald-100">
                        Correct answers: {correctCount}
                      </Badge>
                      <Badge variant="secondary" className="border-rose-400/40 bg-rose-500/10 text-rose-100">
                        Incorrect: {incorrectCount}
                      </Badge>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {["A", "B", "C", "D"].map((key) => {
                        const label = optionLabel(question, key as "A" | "B" | "C" | "D")
                        if (!label) return null
                        const isCorrectOption = key === question.correct_answer
                        return (
                          <div
                            key={key}
                            className={`rounded-xl border px-3 py-3 ${
                              isCorrectOption
                                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                                : "border-white/10 bg-white/5 text-slate-200"
                            }`}
                          >
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{key}</p>
                            <p className="text-sm font-medium">{label}</p>
                            {isCorrectOption && <p className="mt-1 text-xs text-emerald-200">Correct answer</p>}
                          </div>
                        )
                      })}
                    </div>

                    {question.explanation && (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                        <p className="font-semibold text-white">Teacher explanation</p>
                        <p className="mt-2 text-slate-200">{question.explanation}</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </section>
      </div>
    </div>
  )
}

function getStudentDisplayName(summary: StudentSummary) {
  if (summary.profile?.full_name?.trim()) {
    return summary.profile.full_name
  }
  if (summary.profile?.email) {
    return summary.profile.email
  }
  return `${summary.studentId.substring(0, 8)}…`
}

function getStudentEmail(summary: StudentSummary) {
  if (summary.profile?.email && summary.profile.email !== summary.profile.full_name) {
    return summary.profile.email
  }
  return undefined
}

function formatQuestionType(type: string) {
  switch (type) {
    case "yes-no-not-given":
      return "Yes / No / Not Given"
    case "multiple-choice":
      return "Multiple choice"
    default:
      return type
  }
}

function optionLabel(question: Question, key: "A" | "B" | "C" | "D") {
  const lookup: Record<"A" | "B" | "C" | "D", string> = {
    A: question.option_a,
    B: question.option_b,
    C: question.option_c,
    D: question.option_d,
  }
  return lookup[key]
}

function StatCard({
  icon,
  iconClass,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode
  iconClass: string
  label: string
  value: string | number
  helper: string
}) {
  return (
    <Card className="border-white/10 bg-slate-950/60 text-slate-100 shadow-2xl backdrop-blur">
      <CardContent className="space-y-3 p-6">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${iconClass}`}>{icon}</div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
            <p className="text-2xl font-semibold text-white">{value}</p>
          </div>
        </div>
        <p className="text-xs text-slate-400">{helper}</p>
      </CardContent>
    </Card>
  )
}

function InsightBlock({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="text-slate-300">{description}</p>
      </div>
    </div>
  )
}
