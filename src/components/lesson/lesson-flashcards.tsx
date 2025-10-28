"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookmarkCheck, Sparkles } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import FlashcardLearner from "./flashcard-learner";

interface Lesson {
  id: string;
  title: string;
  description: string;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  order_index: number;
}

export default function LessonFlashcards({
  lessonId,
  lesson,
  flashcards,
}: {
  lessonId: string;
  lesson: Lesson;
  flashcards: Flashcard[];
}) {
  const [markedCount, setMarkedCount] = useState(0);
  const totalCards = flashcards.length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-slate-950 to-slate-950" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:26px_26px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-10 md:px-10">
        <header className="flex flex-col gap-6 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-6 text-emerald-50 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4 md:items-center">
            <Link href={`/lesson/${lessonId}/learn`}>
              <Button
                variant="ghost"
                size="icon"
                className="border border-emerald-300/30 bg-emerald-500/20 text-emerald-50 hover:bg-emerald-500/30">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">
                Flashcard review
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-emerald-50">
                {lesson.title}
              </h1>
              <p className="mt-2 text-sm text-emerald-100/80">
                {lesson.description ||
                  "Cycle through the deck, mark tricky cards, and revisit them until they stick."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Link href={`/lesson/${lessonId}/learn`}>
              <Button className="gap-2 border border-white/10 bg-white/10 text-slate-100 hover:bg-white/20">
                <Sparkles className="h-4 w-4" />
                Practice questions
              </Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="border-white/10 bg-slate-950/60 text-slate-100 shadow-2xl backdrop-blur">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-200">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Cards in deck
                  </p>
                  <p className="text-2xl font-semibold text-white">
                    {totalCards}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Take your time—flip, reflect, and only move on when the concept
                feels familiar.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/60 text-slate-100 shadow-2xl backdrop-blur">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/15 text-amber-100">
                  <BookmarkCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Marked for review
                  </p>
                  <p className="text-2xl font-semibold text-white">
                    {markedCount}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Revisit marked cards at the end of your session to reinforce the
                toughest prompts.
              </p>
            </CardContent>
          </Card>
        </section>

        <Card className="border-white/10 bg-slate-950/60 text-slate-100 shadow-2xl backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              Flashcard carousel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {flashcards.length === 0 ? (
              <Card className="border-white/10 bg-white/5 text-slate-200">
                <CardContent className="py-12 text-center text-sm">
                  This lesson doesn’t have flashcards yet. Check back after your
                  teacher adds them.
                </CardContent>
              </Card>
            ) : (
              <FlashcardLearner
                flashcards={flashcards}
                onMarkedChange={setMarkedCount}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
