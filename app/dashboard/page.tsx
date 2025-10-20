import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import TeacherDashboard from "@/components/dashboard/teacher-dashboard"
import StudentDashboard from "@/components/dashboard/student-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  let ensuredProfile = profile

  if (!ensuredProfile) {
    const {
      data: createdProfile,
      error: createProfileError,
    } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email ?? user.user_metadata.email ?? "",
          full_name: user.user_metadata.full_name ?? user.user_metadata.name ?? user.email ?? "",
          role: (user.user_metadata.role as "teacher" | "student") ?? "student",
        },
        { onConflict: "id" },
      )
      .select()
      .single()

    if (createProfileError || !createdProfile) {
      redirect("/auth/login")
    }

    ensuredProfile = createdProfile
  }

  return ensuredProfile.role === "teacher" ? (
    <TeacherDashboard userId={user.id} />
  ) : (
    <StudentDashboard userId={user.id} />
  )
}
