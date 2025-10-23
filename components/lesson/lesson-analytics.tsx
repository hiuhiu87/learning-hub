"use client"

import Link from "next/link"
import { ArrowLeft, Users, CheckCircle2, BarChart3, XCircle, MinusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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

  const totalStudents = studentSummaries.length
  const totalResponses = responses.length
  const correctResponses = responses.filter((r) => r.is_correct).length
  const averageScore =
    studentSummaries.length > 0
      ? Math.round(studentSummaries.reduce((sum, summary) => sum + summary.score, 0) / studentSummaries.length)
      : 0

  const formatAnswer = (question: Question | undefined, key?: string | null) => {
    if (!question || !key) return "—"
    const normalizedKey = key.toUpperCase() as "A" | "B" | "C" | "D"
    const lookup: Record<"A" | "B" | "C" | "D", string> = {
      A: question.option_a,
      B: question.option_b,
      C: question.option_c,
      D: question.option_d,
    }
    const label = lookup[normalizedKey]
    if (!label) return normalizedKey
    return `${label} (${normalizedKey})`
  }

  const formatQuestionType = (type: string) => {
    switch (type) {
      case "yes-no-not-given":
        return "Yes / No / Not Given"
      case "multiple-choice":
        return "Multiple Choice"
      default:
        return type
    }
  }

  const getStudentDisplayName = (summary: StudentSummary) => {
    if (summary.profile?.full_name?.trim()) {
      return summary.profile.full_name
    }
    if (summary.profile?.email) {
      return summary.profile.email
    }
    return `${summary.studentId.substring(0, 8)}…`
  }

  const getStudentEmail = (summary: StudentSummary) => {
    if (summary.profile?.email && summary.profile.email !== summary.profile.full_name) {
      return summary.profile.email
    }
    return undefined
  }

  studentSummaries.sort((a, b) => getStudentDisplayName(a).localeCompare(getStudentDisplayName(b)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lesson Analytics</h1>
              <p className="text-gray-600">{lesson.title}</p>
              <p className="text-sm text-gray-500">
                {lesson.time_limit_minutes != null
                  ? `Time limit: ${lesson.time_limit_minutes} minute${lesson.time_limit_minutes === 1 ? "" : "s"}`
                  : "No time limit set"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
                </div>
                <Users className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Responses</p>
                  <p className="text-3xl font-bold text-gray-900">{totalResponses}</p>
                </div>
                <CheckCircle2 className="h-12 w-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Correct Answers</p>
                  <p className="text-3xl font-bold text-gray-900">{correctResponses}</p>
                </div>
                <CheckCircle2 className="h-12 w-12 text-indigo-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900">{averageScore}%</p>
                </div>
                <BarChart3 className="h-12 w-12 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Performance */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Student Performance</h2>

          {studentSummaries.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">No student responses yet.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="px-0 py-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="px-6 py-4">Student</TableHead>
                      <TableHead className="px-6 py-4">Correct</TableHead>
                      <TableHead className="px-6 py-4">Attempts</TableHead>
                      <TableHead className="px-6 py-4">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentSummaries.map((summary) => (
                      <TableRow key={summary.studentId}>
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{getStudentDisplayName(summary)}</span>
                            {getStudentEmail(summary) && (
                              <span className="text-xs text-gray-500">{getStudentEmail(summary)}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-gray-700">
                          {totalQuestions > 0 ? `${summary.correct} / ${totalQuestions}` : summary.correct}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-gray-700">{summary.attempts}</TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge
                            className={`${
                              summary.score >= 80
                                ? "border-green-200 bg-green-50 text-green-700"
                                : summary.score >= 60
                                  ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                                  : "border-red-200 bg-red-50 text-red-700"
                            }`}
                            variant="outline"
                          >
                            {summary.score}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detailed Responses */}
        {questions.length > 0 && studentSummaries.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Detailed Responses</h2>
            <Accordion type="multiple" className="divide-y rounded-lg border bg-white shadow-md">
              {studentSummaries.map((summary) => (
                <AccordionItem value={summary.studentId} key={summary.studentId} className="border-0">
                  <AccordionTrigger className="px-6">
                    <div className="flex flex-1 flex-col gap-1 text-left">
                      <div className="flex items-center gap-3">
                        <span className="text-base font-semibold text-gray-900">{getStudentDisplayName(summary)}</span>
                        <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-600">
                          {summary.correct} correct · {summary.attempts} attempts
                        </Badge>
                      </div>
                      {getStudentEmail(summary) && (
                        <span className="text-xs text-gray-500">{getStudentEmail(summary)}</span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Question</TableHead>
                            <TableHead>Your Answer</TableHead>
                            <TableHead>Correct Answer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Attempt</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {questions.map((question) => {
                            const response = summary.responses.get(question.id)
                            const status = response ? (response.is_correct ? "correct" : "incorrect") : "not_attempted"

                            const statusBadgeClass =
                              status === "correct"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : status === "incorrect"
                                  ? "border-red-200 bg-red-50 text-red-700"
                                  : "border-gray-200 bg-gray-50 text-gray-600"

                            const statusIcon =
                              status === "correct" ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : status === "incorrect" ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <MinusCircle className="h-4 w-4" />
                              )

                            return (
                              <TableRow key={question.id}>
                                <TableCell>
                                  <div className="flex flex-col gap-2">
                                    <span className="font-medium text-gray-900">{question.question_text}</span>
                                    <div className="flex flex-wrap gap-2">
                                      <Badge variant="outline" className="border-gray-200 bg-white text-gray-600">
                                        {formatQuestionType(question.question_type)}
                                      </Badge>
                                      {status === "incorrect" && question.explanation && (
                                        <span className="text-xs text-red-600">{question.explanation}</span>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-gray-700">
                                  {formatAnswer(questionMap.get(question.id), response?.answer)}
                                </TableCell>
                                <TableCell className="text-gray-700">
                                  {formatAnswer(questionMap.get(question.id), question.correct_answer)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={statusBadgeClass}>
                                    {statusIcon}
                                    {status === "correct"
                                      ? "Correct"
                                      : status === "incorrect"
                                        ? "Incorrect"
                                        : "Not attempted"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-gray-600">
                                  {response?.created_at ? new Date(response.created_at).toLocaleString() : "—"}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-10">
          <Link href="/dashboard">
            <Button variant="outline" className="bg-transparent">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
