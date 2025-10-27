import { redirect } from "next/navigation";

import LessonFlashcards from "@/components/lesson/lesson-flashcards";
import { createClient } from "@/lib/supabase/server";

export default async function FlashcardsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    redirect("/auth/login");
  }

  const { data: enrollment } = await supabase
    .from("lesson_enrollments")
    .select("id")
    .eq("lesson_id", id)
    .eq("student_id", authData.user.id)
    .maybeSingle();

  if (!enrollment) {
    redirect("/dashboard");
  }

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, description")
    .eq("id", id)
    .single();

  if (!lesson) {
    redirect("/dashboard");
  }

  const { data: flashcards } = await supabase
    .from("flashcards")
    .select("*")
    .eq("lesson_id", id)
    .order("order_index");

  return (
    <LessonFlashcards
      lessonId={id}
      lesson={lesson}
      flashcards={flashcards || []}
    />
  );
}
