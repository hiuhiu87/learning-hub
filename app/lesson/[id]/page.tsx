"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FlashcardLearner } from "@/components/flashcard"
import { FillInTheBlank } from "@/components/fill-in-the-blank"
import { SentenceTranslation } from "@/components/sentence-translation"
import QuestionPractice from "@/components/lesson/question-practice"
import type { LessonQuestion } from "@/types/lesson"

const lessonData: Record<
  string,
  {
    title: string
    flashcards: Array<{ id: string; front: string; back: string }>
    fillInTheBlank: Array<{ id: string; sentence: string; blank: string; hint?: string }>
    translation: Array<{
      id: string
      sentence: string
      sourceLanguage: string
      targetLanguage: string
      correctTranslation: string
      options: string[]
    }>
    questions: LessonQuestion[]
  }
> = {
  "1": {
    title: "English Basics",
    flashcards: [
      { id: "1", front: "Hello", back: "A greeting used to say hi to someone" },
      { id: "2", front: "Goodbye", back: "A farewell used when leaving" },
      { id: "3", front: "Thank you", back: "An expression of gratitude" },
      { id: "4", front: "Please", back: "A polite word used to make requests" },
      { id: "5", front: "Excuse me", back: "Used to get someone's attention politely" },
      { id: "6", front: "Sorry", back: "An apology for a mistake or inconvenience" },
    ],
    fillInTheBlank: [
      {
        id: "1",
        sentence: "_ is a polite greeting used to say hello.",
        blank: "Hello",
        hint: "A common greeting",
      },
      {
        id: "2",
        sentence: "When leaving, you say _.",
        blank: "Goodbye",
        hint: "The opposite of hello",
      },
      {
        id: "3",
        sentence: "_ is used to express gratitude.",
        blank: "Thank you",
        hint: "Two words expressing appreciation",
      },
      {
        id: "4",
        sentence: "_ is a polite word used when making requests.",
        blank: "Please",
        hint: "A word that makes requests polite",
      },
      {
        id: "5",
        sentence: "_ me, where is the bathroom?",
        blank: "Excuse",
        hint: "Used to get attention",
      },
    ],
    translation: [
      {
        id: "1",
        sentence: "Hello, how are you?",
        sourceLanguage: "English",
        targetLanguage: "Spanish",
        correctTranslation: "Hola, ¿cómo estás?",
        options: ["Hola, ¿cómo estás?", "Adiós, ¿cómo estás?", "Gracias, ¿cómo estás?"],
      },
      {
        id: "2",
        sentence: "Thank you very much",
        sourceLanguage: "English",
        targetLanguage: "Spanish",
        correctTranslation: "Muchas gracias",
        options: ["Muchas gracias", "Adiós amigo", "Por favor"],
      },
      {
        id: "3",
        sentence: "Excuse me, where is the station?",
        sourceLanguage: "English",
        targetLanguage: "Spanish",
        correctTranslation: "Disculpe, ¿dónde está la estación?",
        options: [
          "Disculpe, ¿dónde está la estación?",
          "Hola, ¿dónde está la estación?",
          "Gracias, ¿dónde está la estación?",
        ],
      },
      {
        id: "4",
        sentence: "I'm sorry",
        sourceLanguage: "English",
        targetLanguage: "Spanish",
        correctTranslation: "Lo siento",
        options: ["Lo siento", "Está bien", "De nada"],
      },
    ],
    questions: [
      {
        id: "yn-1",
        question_text: 'The word "Please" is used to make requests more polite.',
        question_type: "yes-no-not-given",
        correct_answer: "A",
        option_a: "Yes",
        option_b: "No",
        option_c: "Not Given",
        option_d: "",
        explanation: "The flashcards describe \"Please\" as a polite word used when making requests.",
        order_index: 0,
      },
      {
        id: "yn-2",
        question_text: 'The phrase "Goodbye" is used when greeting someone for the first time.',
        question_type: "yes-no-not-given",
        correct_answer: "B",
        option_a: "Yes",
        option_b: "No",
        option_c: "Not Given",
        option_d: "",
        explanation: "\"Goodbye\" is defined as a farewell used when leaving, not a greeting.",
        order_index: 1,
      },
      {
        id: "yn-3",
        question_text: "The lesson teaches how to ask for directions to the nearest hotel.",
        question_type: "yes-no-not-given",
        correct_answer: "C",
        option_a: "Yes",
        option_b: "No",
        option_c: "Not Given",
        option_d: "",
        explanation: "The sample questions focus on greetings and polite phrases; directions are not covered.",
        order_index: 2,
      },
    ],
  },
  "2": {
    title: "Business English",
    flashcards: [
      { id: "1", front: "Meeting", back: "A gathering of people to discuss business" },
      { id: "2", front: "Deadline", back: "The final date or time by which something must be completed" },
      { id: "3", front: "Budget", back: "A plan for spending money" },
      { id: "4", front: "Proposal", back: "A formal suggestion or plan" },
      { id: "5", front: "Presentation", back: "A formal talk to an audience" },
    ],
    fillInTheBlank: [
      {
        id: "1",
        sentence: "The _ is scheduled for tomorrow at 2 PM.",
        blank: "meeting",
        hint: "A business gathering",
      },
      {
        id: "2",
        sentence: "We need to submit the report before the _.",
        blank: "deadline",
        hint: "Final date for submission",
      },
      {
        id: "3",
        sentence: "The _ for this project is $50,000.",
        blank: "budget",
        hint: "Amount of money allocated",
      },
      {
        id: "4",
        sentence: "I will present my _ to the board next week.",
        blank: "proposal",
        hint: "A formal suggestion",
      },
      {
        id: "5",
        sentence: "The _ will take place in the conference room.",
        blank: "presentation",
        hint: "A formal talk",
      },
    ],
    translation: [
      {
        id: "1",
        sentence: "Let's schedule a meeting",
        sourceLanguage: "English",
        targetLanguage: "Spanish",
        correctTranslation: "Programemos una reunión",
        options: ["Programemos una reunión", "Cancelemos la reunión", "Terminemos la reunión"],
      },
      {
        id: "2",
        sentence: "What is the deadline?",
        sourceLanguage: "English",
        targetLanguage: "Spanish",
        correctTranslation: "¿Cuál es la fecha límite?",
        options: ["¿Cuál es la fecha límite?", "¿Cuál es el presupuesto?", "¿Cuál es la propuesta?"],
      },
      {
        id: "3",
        sentence: "I approve the budget",
        sourceLanguage: "English",
        targetLanguage: "Spanish",
        correctTranslation: "Apruebo el presupuesto",
        options: ["Apruebo el presupuesto", "Rechazo el presupuesto", "Cambio el presupuesto"],
      },
      {
        id: "4",
        sentence: "Please review my proposal",
        sourceLanguage: "English",
        targetLanguage: "Spanish",
        correctTranslation: "Por favor, revisa mi propuesta",
        options: [
          "Por favor, revisa mi propuesta",
          "Por favor, aprueba mi propuesta",
          "Por favor, rechaza mi propuesta",
        ],
      },
    ],
    questions: [
      {
        id: "yn-4",
        question_text: "A proposal is a formal suggestion or plan.",
        question_type: "yes-no-not-given",
        correct_answer: "A",
        option_a: "Yes",
        option_b: "No",
        option_c: "Not Given",
        option_d: "",
        explanation: "The flashcard definition for \"Proposal\" states it is a formal suggestion or plan.",
        order_index: 0,
      },
      {
        id: "yn-5",
        question_text: "The lesson states that the project budget is unlimited.",
        question_type: "yes-no-not-given",
        correct_answer: "B",
        option_a: "Yes",
        option_b: "No",
        option_c: "Not Given",
        option_d: "",
        explanation: "Budgets are described as spending plans, not unlimited resources.",
        order_index: 1,
      },
      {
        id: "yn-6",
        question_text: "Submitting a report before the deadline is emphasized in the lesson content.",
        question_type: "yes-no-not-given",
        correct_answer: "A",
        option_a: "Yes",
        option_b: "No",
        option_c: "Not Given",
        option_d: "",
        explanation: "One fill-in-the-blank sentence mentions submitting the report before the deadline.",
        order_index: 2,
      },
    ],
  },
  "3": {
    title: "Travel Phrases",
    flashcards: [
      { id: "1", front: "Where is the bathroom?", back: "A question to find the restroom" },
      { id: "2", front: "How much does it cost?", back: "A question about the price" },
      { id: "3", front: "I don't understand", back: "A statement when you don't comprehend something" },
      { id: "4", front: "Can you help me?", back: "A request for assistance" },
      { id: "5", front: "Where is the train station?", back: "A question to find transportation" },
    ],
    fillInTheBlank: [
      {
        id: "1",
        sentence: "_ is the bathroom?",
        blank: "Where",
        hint: "Question word for location",
      },
      {
        id: "2",
        sentence: "How much does it _?",
        blank: "cost",
        hint: "Price or expense",
      },
      {
        id: "3",
        sentence: "I don't _.",
        blank: "understand",
        hint: "To comprehend",
      },
      {
        id: "4",
        sentence: "Can you _ me?",
        blank: "help",
        hint: "To assist",
      },
      {
        id: "5",
        sentence: "Where is the _ station?",
        blank: "train",
        hint: "Mode of transportation",
      },
    ],
    translation: [
      {
        id: "1",
        sentence: "Where is the bathroom?",
        sourceLanguage: "English",
        targetLanguage: "French",
        correctTranslation: "Où sont les toilettes?",
        options: ["Où sont les toilettes?", "Où est la gare?", "Où est l'hôtel?"],
      },
      {
        id: "2",
        sentence: "How much does it cost?",
        sourceLanguage: "English",
        targetLanguage: "French",
        correctTranslation: "Combien ça coûte?",
        options: ["Combien ça coûte?", "Où est la gare?", "Parlez-vous anglais?"],
      },
      {
        id: "3",
        sentence: "I need help",
        sourceLanguage: "English",
        targetLanguage: "French",
        correctTranslation: "J'ai besoin d'aide",
        options: ["J'ai besoin d'aide", "Je suis perdu", "Parlez plus lentement"],
      },
      {
        id: "4",
        sentence: "Do you speak English?",
        sourceLanguage: "English",
        targetLanguage: "French",
        correctTranslation: "Parlez-vous anglais?",
        options: ["Parlez-vous anglais?", "Où est l'hôtel?", "Combien ça coûte?"],
      },
    ],
    questions: [
      {
        id: "yn-7",
        question_text: "The phrase \"Can you help me?\" is used to request assistance.",
        question_type: "yes-no-not-given",
        correct_answer: "A",
        option_a: "Yes",
        option_b: "No",
        option_c: "Not Given",
        option_d: "",
        explanation: "The flashcard for \"Can you help me?\" explains it is a request for assistance.",
        order_index: 0,
      },
      {
        id: "yn-8",
        question_text: "The lesson teaches how to ask for the hotel price in Japanese.",
        question_type: "yes-no-not-given",
        correct_answer: "C",
        option_a: "Yes",
        option_b: "No",
        option_c: "Not Given",
        option_d: "",
        explanation: "The translations focus on French, not Japanese.",
        order_index: 1,
      },
      {
        id: "yn-9",
        question_text: "One of the flashcards covers finding the train station.",
        question_type: "yes-no-not-given",
        correct_answer: "A",
        option_a: "Yes",
        option_b: "No",
        option_c: "Not Given",
        option_d: "",
        explanation: "A flashcard reads \"Where is the train station?\" which helps with locating it.",
        order_index: 2,
      },
    ],
  },
}

export default function LessonPage({ params }: { params: { id: string } }) {
  const lesson = lessonData[params.id]
  const [activeTab, setActiveTab] = useState("flashcards")
  const handlePracticeAnswer: (questionId: string, selectedAnswer: string, isCorrect: boolean) => void = () => {
    // Static demo only – no persistence required
  }

  if (!lesson) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-600/25 via-slate-950 to-slate-950" />
        <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:26px_26px]" />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-12 text-center md:px-10">
          <h1 className="text-3xl font-semibold text-white">Lesson not found</h1>
          <p className="mt-2 text-sm text-slate-300">The lesson you’re looking for doesn’t exist or has been archived.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/25 via-slate-950 to-slate-950" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:26px_26px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 md:px-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <a href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-300 transition hover:text-white">
              <span aria-hidden>←</span> Back to lessons
            </a>
            <h1 className="mt-3 text-3xl font-semibold text-white">{lesson.title}</h1>
            <p className="mt-2 text-sm text-slate-300">
              Rotate through flashcards, recall prompts, and translation drills to master this topic.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="border border-white/10 bg-white/10 text-slate-100 hover:bg-white/20"
            >
              Share lesson
            </Button>
            <Button className="gap-2 bg-sky-500 text-white hover:bg-sky-400">Start learning</Button>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-4 gap-2 rounded-full border border-white/10 bg-white/5 p-1">
              <TabsTrigger
                value="flashcards"
                className="rounded-full data-[state=active]:bg-sky-500 data-[state=active]:text-white"
              >
                Flashcards
              </TabsTrigger>
              <TabsTrigger
                value="fill-in-blank"
                className="rounded-full data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              >
                Fill in blank
              </TabsTrigger>
              <TabsTrigger
                value="yes-no"
                className="rounded-full data-[state=active]:bg-fuchsia-500 data-[state=active]:text-white"
              >
                Yes / No / NG
              </TabsTrigger>
              <TabsTrigger
                value="translation"
                className="rounded-full data-[state=active]:bg-violet-500 data-[state=active]:text-white"
              >
                Translation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flashcards">
              <FlashcardLearner cards={lesson.flashcards} />
            </TabsContent>

            <TabsContent value="fill-in-blank">
              <FillInTheBlank exercises={lesson.fillInTheBlank} />
            </TabsContent>

            <TabsContent value="yes-no">
              {lesson.questions.length === 0 ? (
                <Card className="border-white/10 bg-white/5 text-slate-200">
                  <CardContent className="py-12 text-center text-sm">
                    No yes / no questions yet. Add a few to check understanding.
                  </CardContent>
                </Card>
              ) : (
                <QuestionPractice questions={lesson.questions} onAnswerQuestion={handlePracticeAnswer} />
              )}
            </TabsContent>

            <TabsContent value="translation">
              <SentenceTranslation exercises={lesson.translation} />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </main>
  )
}
