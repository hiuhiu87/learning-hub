import LoginScreen from "@/src/components/auth/login-screen"
import { createClient } from "@/src/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return <LoginScreen />
}
