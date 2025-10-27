"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Sparkles,
  GraduationCap,
  Users,
  FolderOpenDot,
  Layers,
  Plus,
  RefreshCcw,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

interface Lesson {
  id: string;
  title: string;
  description: string;
  created_at: string;
  time_limit_minutes: number | null;
}

export default function TeacherDashboard({ userId }: { userId: string }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [uniqueStudents, setUniqueStudents] = useState(0);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const supabase = createClient();
  const router = useRouter();

  const fetchDashboardData = useCallback(
    async (options?: { skipInitialSpinner?: boolean }) => {
      if (!options?.skipInitialSpinner) {
        setIsLoading(true);
      }
      setDashboardError(null);

      const { data: lessonData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .eq("teacher_id", userId)
        .order("created_at", { ascending: false });

      if (lessonsError) {
        setLessons([]);
        setUniqueStudents(0);
        setTotalEnrollments(0);
        setDashboardError("We couldn’t load your lessons. Please try again.");
        setIsLoading(false);
        return;
      }

      setLessons(lessonData ?? []);

      if (lessonData && lessonData.length > 0) {
        const lessonIds = lessonData.map((lesson) => lesson.id);
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from("lesson_enrollments")
          .select("student_id, lesson_id")
          .in("lesson_id", lessonIds);

        if (!enrollmentError && enrollmentData) {
          const uniqueStudentCount = new Set(
            enrollmentData.map((item) => item.student_id)
          ).size;
          setUniqueStudents(uniqueStudentCount);
          setTotalEnrollments(enrollmentData.length);
        } else {
          setUniqueStudents(0);
          setTotalEnrollments(0);
        }
      } else {
        setUniqueStudents(0);
        setTotalEnrollments(0);
      }

      setIsLoading(false);
    },
    [supabase, userId]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const latestLesson = useMemo(() => lessons.at(0), [lessons]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchDashboardData({ skipInitialSpinner: true });
    setIsRefreshing(false);
  }, [fetchDashboardData]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),rgba(241,245,249,0.8),rgba(248,250,252,1))] dark:hidden" />
      <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),rgba(15,23,42,0.95),rgba(2,6,23,1))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background:radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:26px_26px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-12 px-6 py-10 md:px-10">
        <header className="flex flex-col gap-6 rounded-3xl border border-slate-200/60 bg-white/70 p-6 shadow-2xl backdrop-blur transition dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4 md:items-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-400 transition dark:border-white/10 dark:bg-sky-500/20 dark:text-sky-200">
              <Sparkles className="size-6" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                LearnHub
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-slate-900 transition dark:text-white">
                Teacher Command Center
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                Design engaging journeys and stay ahead with real-time learning
                signals.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="border border-slate-200/70 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className="size-4" />
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </Button>
            <Link href="/lesson/create">
              <Button className="gap-2 bg-sky-500 text-white hover:bg-sky-400">
                <Plus className="size-4" />
                New Lesson
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-slate-200/70 bg-white text-slate-700 hover:bg-slate-100 hover:text-black dark:border-white/20 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 md:w-auto"
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-slate-200/60 bg-white/80 text-slate-900 shadow-2xl backdrop-blur transition dark:border-white/10 dark:bg-white/10 dark:text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">
                Keep your learners inspired
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-200">
                See what&apos;s live, what&apos;s trending, and who&apos;s
                participating in your classroom.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {isLoading ? (
                <div className="grid gap-4">
                  <div className="h-8 w-3/4 animate-pulse rounded-full bg-white/15" />
                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
                  <div className="h-24 rounded-3xl border border-white/10 bg-white/5" />
                </div>
              ) : latestLesson ? (
                <div className="space-y-5 rounded-3xl border border-slate-200/60 bg-slate-50/70 p-6 transition dark:border-white/10 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400 dark:text-slate-400">
                        Most recent
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900 transition dark:text-white">
                        {latestLesson.title}
                      </h2>
                    </div>
                    <Layers className="size-8 text-sky-400 dark:text-sky-300" />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {latestLesson.description ||
                      "No description provided for this lesson yet."}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="rounded-full border border-slate-200/60 bg-white/70 px-3 py-1 transition dark:border-white/10 dark:bg-white/5">
                      Published{" "}
                      {formatDistanceToNow(new Date(latestLesson.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                    {latestLesson.time_limit_minutes != null && (
                      <span className="rounded-full border border-slate-200/60 bg-white/70 px-3 py-1 transition dark:border-white/10 dark:bg-white/5">
                        {latestLesson.time_limit_minutes} minute
                        {latestLesson.time_limit_minutes === 1 ? "" : "s"}{" "}
                        estimated
                      </span>
                    )}
                    <Link href={`/lesson/${latestLesson.id}/edit`}>
                      <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-sky-600 transition hover:bg-sky-500/20 dark:text-sky-200">
                        Refine content
                      </span>
                    </Link>
                    <Link href={`/lesson/${latestLesson.id}/analytics`}>
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/60 bg-white/70 px-3 py-1 text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                        View analytics
                      </span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600 transition dark:border-dashed dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-slate-200/70 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                    <Sparkles className="size-6" />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-white">
                    No lessons just yet
                  </h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                    Start by creating a lesson template and invite your class to
                    explore.
                  </p>
                  <Link href="/lesson/create">
                    <Button className="mt-5 gap-2 bg-sky-500 text-white hover:bg-sky-400">
                      <Plus className="size-4" />
                      Refine content
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="border-slate-200/60 bg-white/80 text-slate-900 backdrop-blur transition dark:border-white/10 dark:bg-slate-950/50 dark:text-white">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/10 text-sky-500 transition dark:bg-sky-500/15 dark:text-sky-200">
                  <GraduationCap className="size-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Active Lessons
                  </p>
                  <p className="text-3xl font-semibold text-slate-900 dark:text-white">
                    {lessons.length}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Draft, publish, and clone lessons with ease.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200/60 bg-white/80 text-slate-900 backdrop-blur transition dark:border-white/10 dark:bg-slate-950/50 dark:text-white">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-500 transition dark:text-emerald-200">
                  <Users className="size-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Unique Learners
                  </p>
                  <p className="text-3xl font-semibold text-slate-900 dark:text-white">
                    {uniqueStudents}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Across all your published lessons and cohorts.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200/60 bg-white/80 text-slate-900 backdrop-blur transition dark:border-white/10 dark:bg-slate-950/50 dark:text-white">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-400/10 text-indigo-500 transition dark:text-indigo-200">
                  <FolderOpenDot className="size-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Total Enrolments
                  </p>
                  <p className="text-3xl font-semibold text-slate-900 dark:text-white">
                    {totalEnrollments}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Track which lessons are drawing the most attention.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Lesson library
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Organize your curriculum, iterate quickly, and dive into
                performance all in one place.
              </p>
            </div>
            <Button
              variant="secondary"
              className="gap-2 border border-slate-200/70 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:hover:bg-white/10"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className="size-4" />
              Sync
            </Button>
          </div>

          {dashboardError && (
            <Card className="border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
              <CardContent className="flex flex-col gap-3 p-6">
                <p className="text-sm font-medium">{dashboardError}</p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="border border-transparent bg-white text-red-600 hover:bg-red-100 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    onClick={handleRefresh}
                  >
                    Try again
                  </Button>
                  <a
                    href="mailto:support@learnhub.app"
                    className="inline-flex items-center text-sm font-medium text-red-600 underline hover:text-red-700 dark:text-red-100 dark:hover:text-white"
                  >
                    Contact support
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`lesson-skeleton-${index}`}
                  className="rounded-3xl border border-slate-200/60 bg-white/70 p-6 transition dark:border-white/10 dark:bg-white/5"
                >
                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200/70 dark:bg-white/20" />
                  <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200/50 dark:bg-white/10" />
                  <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-slate-200/50 dark:bg-white/10" />
                  <div className="mt-6 flex gap-3">
                    <div className="h-9 w-full animate-pulse rounded bg-slate-200/60 dark:bg-white/15" />
                    <div className="h-9 w-full animate-pulse rounded bg-slate-200/40 dark:bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : lessons.length === 0 ? (
            <Card className="border-dashed border-slate-300 bg-white/70 text-slate-600 transition dark:border-white/20 dark:bg-white/5 dark:text-white">
              <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                <Sparkles className="size-10 text-sky-400 dark:text-sky-300" />
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  Ready to build your first learning path?
                </p>
                <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-300">
                  Kick off with a template or start from scratch—add flashcards,
                  translations, and interactive quizzes as you go.
                </p>
                <Link href="/lesson/create">
                  <Button className="gap-2 bg-sky-500 text-white hover:bg-sky-400">
                    <Plus className="size-4" />
                    Create lesson now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {lessons.map((lesson) => (
                <Card
                  key={lesson.id}
                  className="group relative overflow-hidden border border-slate-200/60 bg-white/80 text-slate-900 transition hover:border-sky-400/40 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:hover:bg-slate-900/60"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 [background:radial-gradient(circle_at_top,_rgba(56,189,248,0.2),transparent_60%)]" />
                  <CardHeader className="relative">
                    <CardTitle className="line-clamp-2 leading-tight text-slate-900 dark:text-white">
                      {lesson.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 text-slate-500 dark:text-slate-300">
                      {lesson.description ||
                        "Add a compelling summary to help learners prepare."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative space-y-5">
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="rounded-full border border-slate-200/60 bg-white/70 px-3 py-1 transition dark:border-white/10 dark:bg-white/5">
                        Updated{" "}
                        {formatDistanceToNow(new Date(lesson.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {lesson.time_limit_minutes != null && (
                        <span className="rounded-full border border-slate-200/60 bg-white/70 px-3 py-1 transition dark:border-white/10 dark:bg-white/5">
                          {lesson.time_limit_minutes} minute
                          {lesson.time_limit_minutes === 1 ? "" : "s"} runtime
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Link
                        href={`/lesson/${lesson.id}/edit`}
                        className="flex-1"
                      >
                        <Button
                          variant="secondary"
                          className="w-full border border-slate-200/60 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                          Edit lesson
                        </Button>
                      </Link>
                      <Link
                        href={`/lesson/${lesson.id}/analytics`}
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          className="w-full border border-slate-200/60 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                        >
                          View analytics
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
