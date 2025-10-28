import { redirect } from "next/navigation"
import { createClient } from "@/src/lib/supabase/server"
import LessonEditor from "@/src/components/lesson/lesson-editor"

export default async function EditLessonPage({ params }: { params: { id: string } }) {
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

  return <LessonEditor userId={authData.user.id} lessonId={params.id} initialLesson={lesson} />
}
