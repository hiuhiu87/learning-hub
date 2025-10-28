"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Bookmark,
  CheckCircle2,
  Compass,
  GraduationCap,
  Library,
  RefreshCcw,
  Search,
  Sparkles,
  TimerReset,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ThemeToggle } from "@/src/components/theme-toggle";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { createClient } from "@/src/lib/supabase/client";

interface Lesson {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  created_at: string;
  time_limit_minutes: number | null;
}

export default function StudentDashboard({ userId }: { userId: string }) {
  const [enrolledLessons, setEnrolledLessons] = useState<Lesson[]>([]);
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const fetchLessons = useCallback(
    async (options?: { skipInitialSpinner?: boolean }) => {
      if (!options?.skipInitialSpinner) {
        setIsLoading(true);
      }
      setDashboardError(null);

      try {
        const [enrollmentResult, allLessonsResult] = await Promise.all([
          supabase
            .from("lesson_enrollments")
            .select("lesson_id")
            .eq("student_id", userId),
          supabase
            .from("lessons")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

        if (enrollmentResult.error) {
          throw enrollmentResult.error;
        }
        if (allLessonsResult.error) {
          throw allLessonsResult.error;
        }

        const lessonIdSet = new Set(
          enrollmentResult.data?.map(entry => entry.lesson_id) ?? []
        );

        const orderedLessons = allLessonsResult.data
          ? [...allLessonsResult.data]
          : [];

        const enrolled = orderedLessons.filter(lesson =>
          lessonIdSet.has(lesson.id)
        );

        setEnrolledLessons(enrolled);
        setAvailableLessons(orderedLessons);
      } catch (error) {
        console.error("Error loading lessons", error);
        setDashboardError(
          "We couldn’t load your lessons right now. Please try again."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [supabase, userId]
  );

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handleEnroll = async (lessonId: string) => {
    setEnrollingId(lessonId);
    setFeedback(null);
    try {
      const { error } = await supabase.from("lesson_enrollments").insert({
        lesson_id: lessonId,
        student_id: userId,
      });

      if (error) {
        throw error;
      }

      const lesson = availableLessons.find(l => l.id === lessonId);
      if (lesson) {
        setEnrolledLessons(prev => [...prev, lesson]);
        setAvailableLessons(prev => prev.filter(l => l.id !== lessonId));
      }
      setFeedback({
        type: "success",
        message:
          "You’ve joined the lesson! Jump in anytime from your active list.",
      });
    } catch (error) {
      console.error("Error enrolling in lesson:", error);
      setFeedback({
        type: "error",
        message: "We couldn’t enroll you just yet. Please try once more.",
      });
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredAvailable = useMemo(
    () =>
      availableLessons.filter(
        lesson =>
          !enrolledLessons.find(e => e.id === lesson.id) &&
          (lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lesson.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()))
      ),
    [availableLessons, enrolledLessons, searchQuery]
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLessons({ skipInitialSpinner: true });
  };

  const nextUpLesson = useMemo(() => enrolledLessons.at(0), [enrolledLessons]);
  const totalAvailable = useMemo(
    () => filteredAvailable.length,
    [filteredAvailable]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.25),rgba(241,245,249,0.85),rgba(248,250,252,1))] dark:hidden" />
      <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.25),rgba(15,23,42,0.95),rgba(2,6,23,1))]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:26px_26px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-10 md:px-10">
        <header className="flex flex-col gap-6 rounded-3xl border border-slate-200/60 bg-white/70 p-6 shadow-2xl backdrop-blur transition dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4 md:items-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-400/10 text-indigo-500 transition dark:bg-indigo-400/15 dark:text-indigo-200">
              <Compass className="size-6" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                LearnHub
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-slate-900 transition dark:text-white">
                Welcome back, learner
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                Pick up where you left off, explore new lessons, and keep your
                streak alive.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="border border-slate-200/70 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
              onClick={handleRefresh}
              disabled={isRefreshing}>
              <RefreshCcw className="size-4" />
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </Button>
            <Button
              variant="outline"
              className="border-slate-200/70 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 md:w-auto"
              onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </header>

        {feedback && (
          <Card
            className={
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-100"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100"
            }>
            <CardContent className="flex items-center gap-3 p-4 text-sm">
              <CheckCircle2
                className={
                  feedback.type === "success"
                    ? "size-5 text-emerald-500 dark:text-emerald-200"
                    : "size-5 text-red-500 dark:text-red-200"
                }
              />
              <span>{feedback.message}</span>
              <Button
                variant="ghost"
                className="ml-auto h-auto p-0 text-xs uppercase tracking-wide text-inherit hover:bg-transparent hover:text-inherit dark:hover:text-white"
                onClick={() => setFeedback(null)}>
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-slate-200/60 bg-white/80 text-slate-900 shadow-2xl backdrop-blur transition dark:border-white/10 dark:bg-white/10 dark:text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">
                Your current journey
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-200">
                Stay consistent with daily practice and your next milestone will
                be closer than ever.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {isLoading ? (
                <div className="grid gap-4">
                  <div className="h-8 w-3/4 animate-pulse rounded-full bg-slate-200/70 dark:bg-white/15" />
                  <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200/60 dark:bg-white/10" />
                  <div className="h-24 rounded-3xl border border-slate-200/60 bg-slate-100/80 dark:border-white/10 dark:bg-white/5" />
                </div>
              ) : nextUpLesson ? (
                <div className="space-y-5 rounded-3xl border border-slate-200/60 bg-slate-50/80 p-6 transition dark:border-white/10 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400 dark:text-slate-400">
                        Next up
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900 transition dark:text-white">
                        {nextUpLesson.title}
                      </h2>
                    </div>
                    <GraduationCap className="size-8 text-indigo-500 dark:text-indigo-200" />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {nextUpLesson.description ||
                      "Glance through the lesson outline and start when you’re ready."}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="rounded-full border border-slate-200/60 bg-white/70 px-3 py-1 transition dark:border-white/10 dark:bg-white/5">
                      Joined{" "}
                      {formatDistanceToNow(new Date(nextUpLesson.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                    {nextUpLesson.time_limit_minutes != null && (
                      <span className="rounded-full border border-slate-200/60 bg-white/70 px-3 py-1 transition dark:border-white/10 dark:bg-white/5">
                        {nextUpLesson.time_limit_minutes} minute
                        {nextUpLesson.time_limit_minutes === 1 ? "" : "s"} focus
                        session
                      </span>
                    )}
                    <Link
                      href={`/lesson/${nextUpLesson.id}/learn`}
                      className="inline-flex items-center gap-1 rounded-full border border-indigo-400/40 bg-indigo-400/10 px-3 py-1 text-indigo-600 transition hover:bg-indigo-400/20 dark:text-indigo-100">
                      Resume now
                    </Link>
                    <Link
                      href={`/lesson/${nextUpLesson.id}/flashcards`}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-emerald-600 transition hover:bg-emerald-400/20 dark:text-emerald-100">
                      Review flashcards
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600 transition dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-slate-200/70 bg-slate-100 text-indigo-500 dark:border-white/10 dark:bg-white/10 dark:text-indigo-200">
                    <Sparkles className="size-6" />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-white">
                    You haven&apos;t enrolled yet
                  </h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                    Discover lessons curated for you and start your first
                    journey today.
                  </p>
                  <a
                    href="#discover-lessons"
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                    Explore lessons
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="border-slate-200/60 bg-white/80 text-slate-900 backdrop-blur transition dark:border-white/10 dark:bg-slate-950/50 dark:text-white">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-400/10 text-indigo-500 transition dark:text-indigo-100">
                  <Library className="size-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Active lessons
                  </p>
                  <p className="text-3xl font-semibold text-slate-900 dark:text-white">
                    {enrolledLessons.length}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Open lessons anytime, progress is saved automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200/60 bg-white/80 text-slate-900 backdrop-blur transition dark:border-white/10 dark:bg-slate-950/50 dark:text-white">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-400/10 text-violet-500 transition dark:text-violet-100">
                  <TimerReset className="size-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Available now
                  </p>
                  <p className="text-3xl font-semibold text-slate-900 dark:text-white">
                    {totalAvailable}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Keep learning fresh by joining a new lesson each week.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {enrolledLessons.length > 0 && (
          <section className="space-y-5">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                My active lessons
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Continue your enrolled lessons and track your consistency.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {enrolledLessons.map(lesson => (
                <Card
                  key={lesson.id}
                  className="group relative overflow-hidden border border-slate-200/60 bg-white/80 text-slate-900 transition hover:border-indigo-400/40 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:hover:bg-slate-900/60">
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 [background:radial-gradient(circle_at_top,_rgba(129,140,248,0.25),transparent_60%)]" />
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2 leading-tight text-slate-900 dark:text-white">
                          {lesson.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3 text-slate-500 dark:text-slate-300">
                          {lesson.description ||
                            "This lesson is ready when you are."}
                        </CardDescription>
                      </div>
                      <CheckCircle2 className="size-5 flex-shrink-0 text-emerald-500 dark:text-emerald-300" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {lesson.time_limit_minutes != null ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {lesson.time_limit_minutes} minute
                        {lesson.time_limit_minutes === 1 ? "" : "s"} planned
                        duration
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No duration
                      </p>
                    )}
                    <div className="flex gap-4 flex-col">
                      <Link href={`/lesson/${lesson.id}/learn`}>
                        <Button className="w-full gap-2 bg-sky-500 text-white hover:bg-sky-400">
                          <Sparkles className="size-4" />
                          Start learning
                        </Button>
                      </Link>
                      <Link href={`/lesson/${lesson.id}/flashcards`}>
                        <Button className="w-full gap-2 border border-emerald-400/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-100">
                          <Bookmark className="size-4" />
                          Review flashcards
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section id="discover-lessons" className="space-y-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Discover lessons
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Search and enroll in new content designed by your mentors.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/60 bg-white/80 p-6 backdrop-blur transition dark:border-white/10 dark:bg-white/5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search lessons by title or description…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-12 rounded-full border border-slate-200/60 bg-white pl-12 text-slate-700 placeholder:text-slate-400 focus-visible:border-sky-400/60 focus-visible:ring-sky-400/40 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100"
              />
            </div>
            {dashboardError && (
              <Card className="border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
                <CardContent className="flex flex-col gap-3 p-6">
                  <p className="text-sm font-medium">{dashboardError}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="border border-transparent bg-white text-red-600 hover:bg-red-100 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                      onClick={handleRefresh}>
                      Try again
                    </Button>
                    <a
                      href="mailto:support@learnhub.app"
                      className="inline-flex items-center text-sm font-medium text-red-700 underline hover:text-red-800 dark:text-red-100 dark:hover:text-white">
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
                    key={`available-skeleton-${index}`}
                    className="rounded-3xl border border-slate-200/60 bg-white/70 p-6 transition dark:border-white/10 dark:bg-white/5">
                    <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200/70 dark:bg-white/20" />
                    <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200/50 dark:bg-white/10" />
                    <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-slate-200/50 dark:bg-white/10" />
                    <div className="mt-6 h-10 w-full animate-pulse rounded bg-slate-200/40 dark:bg-white/15" />
                  </div>
                ))}
              </div>
            ) : filteredAvailable.length === 0 ? (
              <Card className="border-dashed border-slate-300 bg-white/70 text-slate-600 transition dark:border-white/20 dark:bg-white/5 dark:text-white">
                <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                  <Sparkles className="size-10 text-indigo-400 dark:text-indigo-200" />
                  <p className="text-lg font-semibold">
                    {availableLessons.length === 0
                      ? "No lessons available yet."
                      : "No lessons match your search."}
                  </p>
                  <p className="max-w-xl text-sm text-slate-500 dark:text-slate-300">
                    Check back soon—new lessons are added regularly to keep your
                    learning path exciting.
                  </p>
                  <Button
                    variant="secondary"
                    className="gap-2 border border-slate-200/70 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                    onClick={handleRefresh}>
                    <RefreshCcw className="size-4" />
                    Refresh feed
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredAvailable.map(lesson => (
                  <Card
                    key={lesson.id}
                    className="group relative overflow-hidden border border-slate-200/60 bg-white/80 text-slate-900 transition hover:border-indigo-400/40 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:hover:bg-slate-900/60">
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 [background:radial-gradient(circle_at_top,_rgba(99,102,241,0.25),transparent_60%)]" />
                    <CardHeader>
                      <CardTitle className="line-clamp-2 leading-tight text-slate-900 dark:text-white">
                        {lesson.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3 text-slate-500 dark:text-slate-300">
                        {lesson.description ||
                          "A fresh lesson is ready for you to explore."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {lesson.time_limit_minutes != null && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {lesson.time_limit_minutes} minute
                          {lesson.time_limit_minutes === 1 ? "" : "s"} estimated
                          time
                        </p>
                      )}
                      <Button
                        onClick={() => handleEnroll(lesson.id)}
                        disabled={enrollingId === lesson.id}
                        className="w-full gap-2 bg-sky-500 text-white hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-300">
                        {enrollingId === lesson.id ? (
                          <>
                            <RefreshCcw className="size-4 animate-spin" />
                            Enrolling…
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-4" />
                            Enroll & learn
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="flex justify-end">
          <Link href="/dashboard">
            <Button className="gap-2 border border-slate-200/70 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/20">
              Back to dashboard
            </Button>
          </Link>
        </footer>
      </div>
    </div>
  );
}
