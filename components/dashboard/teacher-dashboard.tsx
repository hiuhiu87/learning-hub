"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, BookOpen, Users, BarChart3 } from "lucide-react"

interface Lesson {
  id: string
  title: string
  description: string
  created_at: string
}

export default function TeacherDashboard({ userId }: { userId: string }) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchLessons = async () => {
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .eq("teacher_id", userId)
        .order("created_at", { ascending: false })

      if (data) {
        setLessons(data)
      }
      setIsLoading(false)
    }

    fetchLessons()
  }, [userId, supabase])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
          <p className="text-gray-600">Create and manage your lessons</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Lessons</p>
                  <p className="text-3xl font-bold text-gray-900">{lessons.length}</p>
                </div>
                <BookOpen className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Students Enrolled</p>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                </div>
                <Users className="w-12 h-12 text-indigo-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Avg. Completion</p>
                  <p className="text-3xl font-bold text-gray-900">0%</p>
                </div>
                <BarChart3 className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Lesson Button */}
        <div className="mb-10">
          <Link href="/lesson/create">
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create New Lesson
            </Button>
          </Link>
        </div>

        {/* Lessons List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Lessons</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading lessons...</p>
            </div>
          ) : lessons.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No lessons yet. Create your first lesson to get started!</p>
                <Link href="/lesson/create">
                  <Button>Create First Lesson</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <Card key={lesson.id} className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{lesson.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{lesson.description || "No description"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Link href={`/lesson/${lesson.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/lesson/${lesson.id}/analytics`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                          Analytics
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
