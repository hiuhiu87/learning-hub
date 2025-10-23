"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchLessons = async () => {
      // Fetch enrolled lessons
      const { data: enrollmentData } = await supabase
        .from("lesson_enrollments")
        .select("lesson_id")
        .eq("student_id", userId);

      if (enrollmentData) {
        const lessonIds = enrollmentData.map(e => e.lesson_id);
        if (lessonIds.length > 0) {
          const { data: lessons } = await supabase
            .from("lessons")
            .select("*")
            .in("id", lessonIds);
          if (lessons) {
            setEnrolledLessons(lessons);
          }
        }
      }

      // Fetch all available lessons
      const { data: allLessons } = await supabase
        .from("lessons")
        .select("*")
        .order("created_at", { ascending: false });

      if (allLessons) {
        setAvailableLessons(allLessons);
      }

      setIsLoading(false);
    };

    fetchLessons();
  }, [userId, supabase]);

  const handleEnroll = async (lessonId: string) => {
    setEnrollingId(lessonId);
    try {
      const { error } = await supabase.from("lesson_enrollments").insert({
        lesson_id: lessonId,
        student_id: userId,
      });

      if (error) throw error;

      // Move lesson from available to enrolled
      const lesson = availableLessons.find(l => l.id === lessonId);
      if (lesson) {
        setEnrolledLessons([...enrolledLessons, lesson]);
        setAvailableLessons(availableLessons.filter(l => l.id !== lessonId));
      }
    } catch (error) {
      console.error("Error enrolling in lesson:", error);
      alert("Error enrolling in lesson. Please try again.");
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredAvailable = availableLessons.filter(
    lesson =>
      !enrolledLessons.find(e => e.id === lesson.id) &&
      (lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Student Dashboard
            </h1>
            <p className="text-gray-600">
              Learn and practice with interactive lessons
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full bg-transparent md:w-auto"
            onClick={handleLogout}>
            Sign out
          </Button>
        </div>

        {/* Enrolled Lessons */}
        {enrolledLessons.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              My Lessons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledLessons.map(lesson => (
                <Card
                  key={lesson.id}
                  className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">
                          {lesson.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {lesson.description || "No description"}
                        </CardDescription>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {lesson.time_limit_minutes != null && (
                      <p className="text-xs text-gray-500 mb-4">
                        Time limit: {lesson.time_limit_minutes} minute
                        {lesson.time_limit_minutes === 1 ? "" : "s"}
                      </p>
                    )}
                    <Link href={`/lesson/${lesson.id}/learn`}>
                      <Button className="w-full">Start Learning</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Lessons */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Available Lessons
          </h2>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading lessons...</p>
            </div>
          ) : filteredAvailable.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {availableLessons.length === 0
                    ? "No lessons available yet."
                    : "No lessons match your search."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAvailable.map(lesson => (
                <Card
                  key={lesson.id}
                  className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {lesson.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {lesson.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {lesson.time_limit_minutes != null && (
                      <p className="text-xs text-gray-500 mb-4">
                        Time limit: {lesson.time_limit_minutes} minute
                        {lesson.time_limit_minutes === 1 ? "" : "s"}
                      </p>
                    )}
                    <Button
                      onClick={() => handleEnroll(lesson.id)}
                      disabled={enrollingId === lesson.id}
                      className="w-full">
                      {enrollingId === lesson.id
                        ? "Enrolling..."
                        : "Enroll & Learn"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
