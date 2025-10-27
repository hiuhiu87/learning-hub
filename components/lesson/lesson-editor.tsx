"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft } from "lucide-react";
import FlashcardEditor from "./flashcard-editor";
import QuestionEditor from "./question-editor";
import type { LessonQuestion } from "@/types/lesson";
import { toast } from "sonner";

interface Lesson {
  id: string;
  title: string;
  description: string;
  time_limit_minutes: number | null;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  order_index: number;
}

const generateUuid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  return template.replace(/[xy]/g, char => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

export default function LessonEditor({
  userId,
  lessonId,
  initialLesson,
}: {
  userId: string;
  lessonId?: string;
  initialLesson?: Lesson;
}) {
  const [title, setTitle] = useState(initialLesson?.title || "");
  const [description, setDescription] = useState(
    initialLesson?.description || ""
  );
  const [timeLimit, setTimeLimit] = useState(
    initialLesson?.time_limit_minutes
      ? String(initialLesson.time_limit_minutes)
      : ""
  );
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [questions, setQuestions] = useState<LessonQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (initialLesson) {
      setTimeLimit(
        initialLesson.time_limit_minutes
          ? String(initialLesson.time_limit_minutes)
          : ""
      );
    }
  }, [initialLesson]);

  useEffect(() => {
    if (lessonId) {
      const fetchContent = async () => {
        setIsLoading(true);
        const [{ data: flashcardData }, { data: questionData }] =
          await Promise.all([
            supabase
              .from("flashcards")
              .select("*")
              .eq("lesson_id", lessonId)
              .order("order_index"),
            supabase
              .from("questions")
              .select("*")
              .eq("lesson_id", lessonId)
              .order("order_index"),
          ]);

        if (flashcardData) setFlashcards(flashcardData);
        if (questionData)
          setQuestions(
            questionData.map(rawQuestion => {
              const question = rawQuestion as LessonQuestion;
              const base: LessonQuestion = {
                ...question,
                question_type: question.question_type || "multiple-choice",
              };
              if (base.question_type === "yes-no-not-given") {
                return {
                  ...base,
                  option_a: base.option_a || "Yes",
                  option_b: base.option_b || "No",
                  option_c: base.option_c || "Not Given",
                  option_d: "",
                };
              }
              return base;
            })
          );
        setIsLoading(false);
      };

      fetchContent();
    }
  }, [lessonId, supabase]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.warning("Please enter a lesson title");
      return;
    }

    const trimmedTimeLimit = timeLimit.trim();
    const parsedTimeLimit =
      trimmedTimeLimit === "" ? null : Number.parseInt(trimmedTimeLimit, 10);

    if (
      parsedTimeLimit !== null &&
      (Number.isNaN(parsedTimeLimit) || parsedTimeLimit <= 0)
    ) {
      alert("Please enter a positive number of minutes or leave blank.");
      return;
    }

    setIsSaving(true);

    try {
      let currentLessonId = lessonId;

      if (!currentLessonId) {
        const newLessonId = generateUuid();
        const { error: lessonError } = await supabase.from("lessons").insert({
          id: newLessonId,
          teacher_id: userId,
          title,
          description,
          time_limit_minutes: parsedTimeLimit,
        });

        if (lessonError) throw lessonError;
        currentLessonId = newLessonId;
      } else {
        const { error: updateError } = await supabase
          .from("lessons")
          .update({ title, description, time_limit_minutes: parsedTimeLimit })
          .eq("id", currentLessonId);

        if (updateError) throw updateError;
      }

      // Save flashcards
      for (const flashcard of flashcards) {
        if (flashcard.id.startsWith("new-")) {
          const { error } = await supabase.from("flashcards").insert({
            lesson_id: currentLessonId,
            front: flashcard.front,
            back: flashcard.back,
            order_index: flashcard.order_index,
          });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("flashcards")
            .update({
              front: flashcard.front,
              back: flashcard.back,
              order_index: flashcard.order_index,
            })
            .eq("id", flashcard.id);
          if (error) throw error;
        }
      }

      // Save questions
      for (const question of questions) {
        if (question.id.startsWith("new-")) {
          const { error } = await supabase.from("questions").insert({
            lesson_id: currentLessonId,
            question_text: question.question_text,
            question_type: question.question_type,
            correct_answer: question.correct_answer,
            option_a: question.option_a,
            option_b: question.option_b,
            option_c: question.option_c,
            option_d: question.option_d,
            explanation: question.explanation,
            order_index: question.order_index,
          });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("questions")
            .update({
              question_text: question.question_text,
              question_type: question.question_type,
              correct_answer: question.correct_answer,
              option_a: question.option_a,
              option_b: question.option_b,
              option_c: question.option_c,
              option_d: question.option_d,
              explanation: question.explanation,
              order_index: question.order_index,
            })
            .eq("id", question.id);
          if (error) throw error;
        }
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving lesson:", error);
      alert("Error saving lesson. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const addFlashcard = () => {
    setFlashcards([
      ...flashcards,
      {
        id: `new-${Date.now()}`,
        front: "",
        back: "",
        order_index: flashcards.length,
      },
    ]);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `new-${Date.now()}`,
        question_text: "",
        question_type: "multiple-choice",
        correct_answer: "A",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        explanation: "",
        order_index: questions.length,
      },
    ]);
  };

  const updateFlashcard = (id: string, updates: Partial<Flashcard>) => {
    setFlashcards(
      flashcards.map(fc => (fc.id === id ? { ...fc, ...updates } : fc))
    );
  };

  const deleteFlashcard = (id: string) => {
    setFlashcards(flashcards.filter(fc => fc.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<LessonQuestion>) => {
    setQuestions(questions.map(q => (q.id === id ? { ...q, ...updates } : q)));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),rgba(241,245,249,0.85),rgba(248,250,252,1))] dark:hidden" />
      <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),rgba(15,23,42,0.95),rgba(2,6,23,1))]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:26px_26px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 md:px-10">
        <header className="flex flex-col gap-6 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-2xl backdrop-blur transition dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4 md:items-center">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-700 dark:text-white outline-none hover:bg-transparent dark:hover:bg-transparent hover:animate-[ease-in-out]">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
                Lesson Builder
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-slate-900 transition dark:text-white">
                {lessonId ? "Refine your lesson" : "Create a new lesson"}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-300">
                Outline the story, craft practice moments, and get ready to
                delight learners with a structured journey.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="border border-slate-200/70 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
                type="button">
                Discard changes
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2 bg-sky-500 text-white hover:bg-sky-400">
              {isSaving ? "Saving…" : "Save lesson"}
            </Button>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-[1fr]">
          <Card className="border-slate-200/60 bg-white/80 text-slate-900 shadow-2xl backdrop-blur transition dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">
                Lesson details
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-300">
                Give learners context: what will they master and how long will
                it take?
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="title"
                  className="text-sm text-slate-600 dark:text-slate-300">
                  Lesson title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="E.g. Conversational Spanish: polite requests"
                  className="border-slate-200/60 bg-white text-slate-700 placeholder:text-slate-400 focus-visible:border-sky-400/60 focus-visible:ring-sky-400/40 dark:border-white/15 dark:bg-slate-950/60 dark:text-slate-100"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="description"
                  className="text-sm text-slate-600 dark:text-slate-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the experience, prerequisites, or outcomes learners should expect."
                  className="border-slate-200/60 bg-white text-slate-700 placeholder:text-slate-400 focus-visible:border-sky-400/60 focus-visible:ring-sky-400/40 dark:border-white/15 dark:bg-slate-950/60 dark:text-slate-100"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="timeLimit"
                  className="text-sm text-slate-600 dark:text-slate-300">
                  Time limit (minutes)
                </Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min={1}
                  step={1}
                  value={timeLimit}
                  onChange={e => setTimeLimit(e.target.value)}
                  placeholder="Optional"
                  className="border-slate-200/60 bg-white text-slate-700 placeholder:text-slate-400 focus-visible:border-sky-400/60 focus-visible:ring-sky-400/40 dark:border-white/15 dark:bg-slate-950/60 dark:text-slate-100"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Leave blank for a self-paced lesson or set a focused sprint
                  duration.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-slate-600 dark:text-slate-300">
                  At a glance
                </Label>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-300">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/70 px-3 py-1 transition dark:border-white/10 dark:bg-white/5">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    {flashcards.length} flashcards
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/70 px-3 py-1 transition dark:border-white/10 dark:bg-white/5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    {questions.length} questions
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 bg-white/80 text-slate-900 shadow-2xl backdrop-blur transition dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">
                Lesson content
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-300">
                Curate a blend of memory-building flashcards and questions that
                check comprehension.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="flashcards" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 gap-2 rounded-full border border-slate-200/60 bg-white/70 p-1 transition dark:border-white/10 dark:bg-white/5">
                  <TabsTrigger
                    value="flashcards"
                    className="rounded-full data-[state=active]:bg-sky-500 data-[state=active]:text-white">
                    Flashcards ({flashcards.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="questions"
                    className="rounded-full data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                    Questions ({questions.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="flashcards" className="space-y-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <div
                          key={`flashcard-skeleton-${index}`}
                          className="h-40 animate-pulse rounded-2xl border border-slate-200/60 bg-white/70 transition dark:border-white/10 dark:bg-white/5"
                        />
                      ))}
                    </div>
                  ) : flashcards.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm text-slate-500 transition dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                      No flashcards yet. Introduce core concepts first to prime
                      learners for practice.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {flashcards.map((flashcard, index) => (
                        <FlashcardEditor
                          key={flashcard.id}
                          index={index + 1}
                          flashcard={flashcard}
                          onUpdate={updates =>
                            updateFlashcard(flashcard.id, updates)
                          }
                          onDelete={() => deleteFlashcard(flashcard.id)}
                        />
                      ))}
                    </div>
                  )}
                  <Button
                    onClick={addFlashcard}
                    variant="secondary"
                    className="w-full gap-2 border border-sky-500/40 bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 dark:text-sky-100"
                    type="button">
                    <Plus className="h-4 w-4" />
                    Add flashcard
                  </Button>
                </TabsContent>

                <TabsContent value="questions" className="space-y-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <div
                          key={`question-skeleton-${index}`}
                          className="h-48 animate-pulse rounded-2xl border border-slate-200/60 bg-white/70 transition dark:border-white/10 dark:bg-white/5"
                        />
                      ))}
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm text-slate-500 transition dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                      No questions yet. Validate understanding with
                      multiple-choice or yes/no checkpoints.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <QuestionEditor
                          key={question.id}
                          index={index + 1}
                          question={question}
                          onUpdate={updates =>
                            updateQuestion(question.id, updates)
                          }
                          onDelete={() => deleteQuestion(question.id)}
                        />
                      ))}
                    </div>
                  )}
                  <Button
                    onClick={addQuestion}
                    variant="secondary"
                    className="w-full gap-2 border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-100"
                    type="button">
                    <Plus className="h-4 w-4" />
                    Add question
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        <footer className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link href="/dashboard" className="sm:w-auto">
            <Button
              variant="outline"
              className="w-full border border-slate-200/70 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/20"
              type="button">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full gap-2 bg-sky-500 text-white hover:bg-sky-400 sm:w-auto">
            {isSaving ? "Saving…" : "Save lesson"}
          </Button>
        </footer>
      </div>
    </div>
  );
}
