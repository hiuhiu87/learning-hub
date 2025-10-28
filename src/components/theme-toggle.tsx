"use client"

import { useTransition } from "react"
import { useTheme } from "next-themes"
import { MonitorCog, MoonStar, SunMedium } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"

const themes = [
  { value: "light", label: "Light", icon: SunMedium },
  { value: "dark", label: "Dark", icon: MoonStar },
  { value: "system", label: "System", icon: MonitorCog },
] as const

export function ThemeToggle() {
  const { setTheme, theme, systemTheme } = useTheme()
  const [isPending, startTransition] = useTransition()

  const currentTheme = theme === "system" ? systemTheme ?? "light" : theme

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-900 transition hover:bg-white/15 dark:text-slate-100"
          aria-label="Toggle theme"
        >
          <SunMedium className="size-4 rotate-0 scale-100 transition dark:-rotate-90 dark:scale-0" />
          <MoonStar className="absolute size-4 rotate-90 scale-0 transition dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themes.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() =>
              startTransition(() => {
                setTheme(value)
              })
            }
            className="flex items-center gap-2"
          >
            <Icon className="size-4" />
            <span>{label}</span>
            {value === (theme ?? "light") && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
