import { redirect } from "next/navigation"
import { createClient } from "@/src/lib/supabase/server"
import LessonAnalytics from "@/src/components/lesson/lesson-analytics"

export default async function AnalyticsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", authData.user.id).single()

  if (!profile || profile.role !== "teacher") {
    redirect("/dashboard")
  }

  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", params.id).single()

  if (!lesson || lesson.teacher_id !== authData.user.id) {
    redirect("/dashboard")
  }

  const [{ data: enrollments }, { data: responses }, { data: questions }] = await Promise.all([
    supabase.from("lesson_enrollments").select("student_id").eq("lesson_id", params.id),
    supabase.from("student_responses").select("*").eq("lesson_id", params.id),
    supabase
      .from("questions")
      .select("id, question_text, question_type, correct_answer, option_a, option_b, option_c, option_d, explanation")
      .eq("lesson_id", params.id)
      .order("order_index", { ascending: true }),
  ])

  const studentIds = new Set<string>()
  enrollments?.forEach((enrollment) => studentIds.add(enrollment.student_id))
  responses?.forEach((response) => studentIds.add(response.student_id))

  let students: Array<{ id: string; full_name: string | null; email: string | null }> = []
  if (studentIds.size > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", Array.from(studentIds))
    if (profiles) {
      students = profiles
    }
  }

  return (
    <LessonAnalytics
      lesson={lesson}
      enrollments={enrollments || []}
      responses={responses || []}
      questions={questions || []}
      students={students}
    />
  )
}
