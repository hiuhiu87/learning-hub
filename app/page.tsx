"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const lessons = [
  {
    id: 1,
    title: "English Basics",
    description: "Learn fundamental English vocabulary and phrases",
    progress: 60,
    cards: 12,
  },
  {
    id: 2,
    title: "Business English",
    description: "Professional vocabulary for workplace communication",
    progress: 30,
    cards: 15,
  },
  {
    id: 3,
    title: "Travel Phrases",
    description: "Essential phrases for traveling abroad",
    progress: 0,
    cards: 10,
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">LearnCards</h1>
              <p className="mt-1 text-sm text-blue-600">Master languages with interactive flashcards</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Lessons</h2>
          <p className="mt-2 text-gray-600">Continue learning or start a new lesson</p>
        </div>

        {/* Lessons Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:border-blue-300">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900">{lesson.title}</CardTitle>
                  <CardDescription>{lesson.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-blue-600">{lesson.progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                        style={{ width: `${lesson.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Card Count */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{lesson.cards} cards</span>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Start
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
