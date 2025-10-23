"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const isDisabled = useMemo(() => isLoading || !email.trim() || !password.trim(), [email, isLoading, password])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6 py-16 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 md:px-10 lg:px-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.3),rgba(241,245,249,0.9),rgba(248,250,252,1))] dark:hidden" />
      <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),rgba(15,23,42,0.95),rgba(2,6,23,1))]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(circle_at_center,white,transparent_65%)]" />

      <div className="relative z-10 grid w-full max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden flex-col justify-between gap-6 md:flex">
          <div className="flex items-center justify-end">
            <ThemeToggle />
          </div>
          <div className="space-y-6 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur transition dark:border-white/10 dark:bg-white/5">
            <span className="inline-flex items-center rounded-full border border-sky-500/50 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-500 transition dark:text-sky-200">
              Welcome to LearnHub
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-900 transition dark:text-white md:text-5xl">
              Empower every learner with structured, bite-sized lessons.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Curate engaging courses, track learner progress, and deliver memorable learning experiences in one
              modern platform.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Guided Flows",
                description: "Blend flashcards, quizzes, and translations into immersive lesson paths.",
              },
              {
                title: "Smart Insights",
                description: "Understand class performance at a glance with real-time analytics.",
              },
              {
                title: "Effortless Collaboration",
                description: "Invite co-teachers, share templates, and reuse content without friction.",
              },
              {
                title: "Responsive First",
                description: "Optimized experiences across desktop, tablet, and mobile devices.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 backdrop-blur transition dark:border-white/5 dark:bg-white/5"
              >
                <h2 className="text-lg font-semibold text-slate-900 transition dark:text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="relative border border-slate-200/70 bg-white/95 shadow-2xl backdrop-blur-lg transition dark:border-white/10 dark:bg-white/10">
          <div className="absolute -top-12 left-1/2 hidden h-24 w-24 -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl md:block" />
          <div className="absolute right-4 top-4 md:hidden">
            <ThemeToggle />
          </div>
          <CardHeader className="space-y-3 pb-2">
            <div>
              <CardTitle className="text-center text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Sign in to LearnHub
              </CardTitle>
              <CardDescription className="text-center text-base text-slate-500 dark:text-slate-300">
                Continue building and exploring your learning journeys.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error ? (
                <p className="text-sm font-medium text-red-500" role="alert">
                  {error}
                </p>
              ) : (
                <p className="text-xs text-slate-500">We keep your information secure and never share your data.</p>
              )}
              <Button type="submit" className="w-full" disabled={isDisabled}>
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <div className="space-y-3 text-center text-sm">
              <div>
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="font-medium text-sky-600 transition hover:text-sky-700">
                  Create one
                </Link>
              </div>
              <p className="text-xs text-slate-400">
                Need help? <a href="mailto:support@learnhub.app" className="underline">Contact support</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
