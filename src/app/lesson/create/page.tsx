import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import LessonEditor from "@/src/components/lesson/lesson-editor";

export default async function CreateLessonPage() {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();

  
  if (authError || !authData?.user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (!profile || profile.role !== "teacher") {
    redirect("/dashboard");
  }

  return <LessonEditor userId={authData.user.id} />;
}
