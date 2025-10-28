"use client"

import { useState } from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { ChevronLeft, ChevronRight, RotateCw, Lightbulb } from "lucide-react"
import { Textarea } from "@/src/components/ui/textarea"

const translations = [
  {
    id: 1,
    english: "The weather is beautiful today.",
    reference: "Thời tiết hôm nay rất đẹp.",
    hint: 'Start with "Thời tiết"',
  },
  {
    id: 2,
    english: "I have been learning English for three years.",
    reference: "Tôi đã học tiếng Anh trong ba năm.",
    hint: 'Use "đã học" for past action continuing to present',
  },
  {
    id: 3,
    english: "Can you help me with this problem?",
    reference: "Bạn có thể giúp tôi với vấn đề này không?",
    hint: 'Use "có thể" for ability/possibility',
  },
  {
    id: 4,
    english: "She is interested in learning new languages.",
    reference: "Cô ấy quan tâm đến việc học các ngôn ngữ mới.",
    hint: 'Use "quan tâm đến" for interest',
  },
]

export default function TranslationView() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userTranslation, setUserTranslation] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const current = translations[currentIndex]

  const handleNext = () => {
    if (currentIndex < translations.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserTranslation("")
      setSubmitted(false)
      setShowHint(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setUserTranslation("")
      setSubmitted(false)
      setShowHint(false)
    }
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="border-white/10 bg-white/10 text-white">
          Translation workshop
        </Badge>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
          {currentIndex + 1} / {translations.length}
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-fuchsia-500 via-sky-500 to-emerald-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / translations.length) * 100}%` }}
        />
      </div>

      <Card className="border-white/10 bg-slate-950/60 text-slate-100 shadow-2xl backdrop-blur">
        <CardContent className="space-y-3 p-8 text-center">
          <p className="text-lg font-semibold text-white">“{current.english}”</p>
          <p className="text-sm text-slate-300">Translate this sentence to Vietnamese</p>
        </CardContent>
      </Card>

      <Textarea
        placeholder="Type your translation..."
        value={userTranslation}
        onChange={(e) => setUserTranslation(e.target.value)}
        disabled={submitted}
        className="min-h-28 resize-none border-white/15 bg-slate-950/60 text-slate-100 placeholder:text-slate-400 focus-visible:border-sky-400/60 focus-visible:ring-sky-400/40"
      />

      {!submitted && (
        <Button
          variant="ghost"
          onClick={() => setShowHint((prev) => !prev)}
          className="w-full gap-2 border border-white/10 bg-white/5 text-slate-100 hover:bg-white/15"
        >
          <Lightbulb className="h-4 w-4" />
          {showHint ? "Hide hint" : "Show hint"}
        </Button>
      )}

      {showHint && !submitted && (
        <Card className="border-amber-400/40 bg-amber-500/10 text-amber-100">
          <CardContent className="p-4 text-sm">{current.hint}</CardContent>
        </Card>
      )}

      {!submitted && (
        <Button
          onClick={handleSubmit}
          disabled={!userTranslation.trim()}
          className="w-full gap-2 bg-fuchsia-500 text-white hover:bg-fuchsia-400 disabled:bg-slate-700 disabled:text-slate-300"
        >
          Submit translation
        </Button>
      )}

      {submitted && (
        <Card className="border-white/10 bg-white/5 text-slate-200">
          <CardContent className="space-y-4 p-6 text-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Your translation</p>
              <p className="mt-2 text-white">{userTranslation}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Reference translation</p>
              <p className="mt-2 text-white">{current.reference}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 gap-2 border border-white/10 bg-white/5 text-slate-100 hover:bg-white/15 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentIndex === translations.length - 1 || !submitted}
          className="flex-1 gap-2 bg-sky-500 text-white hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-300"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="ghost"
        onClick={() => {
          setCurrentIndex(0)
          setUserTranslation("")
          setSubmitted(false)
          setShowHint(false)
        }}
        className="w-full gap-2 border border-white/10 bg-white/5 text-slate-100 hover:bg-white/15"
      >
        <RotateCw className="h-4 w-4" />
        Start over
      </Button>
    </div>
  )
}
