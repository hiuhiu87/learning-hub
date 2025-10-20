import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LessonLearner from "@/components/lesson/lesson-learner"

export default async function LearnPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    redirect("/auth/login")
  }

  // Check if student is enrolled
  const { data: enrollment } = await supabase
    .from("lesson_enrollments")
    .select("*")
    .eq("lesson_id", params.id)
    .eq("student_id", authData.user.id)
    .single()

  if (!enrollment) {
    redirect("/dashboard")
  }

  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", params.id).single()

  if (!lesson) {
    redirect("/dashboard")
  }

  const [{ data: flashcards }, { data: questions }, { data: attempts }] = await Promise.all([
    supabase.from("flashcards").select("*").eq("lesson_id", params.id).order("order_index"),
    supabase.from("questions").select("*").eq("lesson_id", params.id).order("order_index"),
    supabase
      .from("lesson_attempts")
      .select("*")
      .eq("lesson_id", params.id)
      .eq("student_id", authData.user.id)
      .order("created_at", { ascending: false }),
  ])

  return (
    <LessonLearner
      lessonId={params.id}
      lesson={lesson}
      flashcards={flashcards || []}
      questions={questions || []}
      userId={authData.user.id}
      previousAttempts={attempts || []}
    />
  )
}
