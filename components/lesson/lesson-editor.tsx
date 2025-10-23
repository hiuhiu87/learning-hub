"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft } from "lucide-react";
import FlashcardEditor from "./flashcard-editor";
import QuestionEditor from "./question-editor";
import type { LessonQuestion, QuestionType } from "@/types/lesson";

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
    initialLesson?.time_limit_minutes ? String(initialLesson.time_limit_minutes) : ""
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
              const question = rawQuestion as LessonQuestion
              const base: LessonQuestion = {
                ...question,
                question_type: question.question_type || "multiple-choice",
              }
              if (base.question_type === "yes-no-not-given") {
                return {
                  ...base,
                  option_a: base.option_a || "Yes",
                  option_b: base.option_b || "No",
                  option_c: base.option_c || "Not Given",
                  option_d: "",
                }
              }
              return base
            })
          );
        setIsLoading(false);
      };

      fetchContent();
    }
  }, [lessonId, supabase]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a lesson title");
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
        const { error: lessonError } = await supabase.from("lessons").insert(
          {
            id: newLessonId,
            teacher_id: userId,
            title,
            description,
            time_limit_minutes: parsedTimeLimit,
          },
          { returning: "minimal" }
        );

        if (lessonError) throw lessonError;
        currentLessonId = newLessonId;
      } else {
        const { error: updateError } = await supabase
          .from("lessons")
          .update(
            { title, description, time_limit_minutes: parsedTimeLimit },
            { returning: "minimal" }
          )
          .eq("id", currentLessonId);

        if (updateError) throw updateError;
      }

      // Save flashcards
      for (const flashcard of flashcards) {
        if (flashcard.id.startsWith("new-")) {
          const { error } = await supabase.from("flashcards").insert(
            {
              lesson_id: currentLessonId,
              front: flashcard.front,
              back: flashcard.back,
              order_index: flashcard.order_index,
            },
            { returning: "minimal" }
          );
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("flashcards")
            .update(
              {
                front: flashcard.front,
                back: flashcard.back,
                order_index: flashcard.order_index,
              },
              { returning: "minimal" }
            )
            .eq("id", flashcard.id);
          if (error) throw error;
        }
      }

      // Save questions
      for (const question of questions) {
        if (question.id.startsWith("new-")) {
          const { error } = await supabase.from("questions").insert(
            {
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
            },
            { returning: "minimal" }
          );
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("questions")
            .update(
              {
                question_text: question.question_text,
                question_type: question.question_type,
                correct_answer: question.correct_answer,
                option_a: question.option_a,
                option_b: question.option_b,
                option_c: question.option_c,
                option_d: question.option_d,
                explanation: question.explanation,
                order_index: question.order_index,
              },
              { returning: "minimal" }
            )
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {lessonId ? "Edit Lesson" : "Create New Lesson"}
              </h1>
              <p className="text-gray-600">
                Add flashcards and practice questions
              </p>
            </div>
          </div>
        </div>

        {/* Lesson Details */}
        <Card className="border-0 shadow-md mb-8">
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Lesson Title</Label>
            <Input
              id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter lesson title"
                className="mt-2"
              />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter lesson description"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
            <Input
              id="timeLimit"
              type="number"
              min={1}
              step={1}
              value={timeLimit}
              onChange={e => setTimeLimit(e.target.value)}
              placeholder="Leave blank for no time limit"
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="flashcards" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="flashcards">
              Flashcards ({flashcards.length})
            </TabsTrigger>
            <TabsTrigger value="questions">
              Questions ({questions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flashcards" className="space-y-4">
            {flashcards.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600 mb-4">
                    No flashcards yet. Add one to get started!
                  </p>
                  <Button onClick={addFlashcard} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Flashcard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {flashcards.map(flashcard => (
                    <FlashcardEditor
                      key={flashcard.id}
                      flashcard={flashcard}
                      onUpdate={updates =>
                        updateFlashcard(flashcard.id, updates)
                      }
                      onDelete={() => deleteFlashcard(flashcard.id)}
                    />
                  ))}
                </div>
                <Button
                  onClick={addFlashcard}
                  variant="outline"
                  className="w-full gap-2 bg-transparent">
                  <Plus className="w-4 h-4" />
                  Add Another Flashcard
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            {questions.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600 mb-4">
                    No questions yet. Add one to get started!
                  </p>
                  <Button onClick={addQuestion} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {questions.map(question => (
                    <QuestionEditor
                      key={question.id}
                      question={question}
                      onUpdate={updates => updateQuestion(question.id, updates)}
                      onDelete={() => deleteQuestion(question.id)}
                    />
                  ))}
                </div>
                <Button
                  onClick={addQuestion}
                  variant="outline"
                  className="w-full gap-2 bg-transparent">
                  <Plus className="w-4 h-4" />
                  Add Another Question
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex gap-4">
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Cancel
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? "Saving..." : "Save Lesson"}
          </Button>
        </div>
      </div>
    </div>
  );
}
