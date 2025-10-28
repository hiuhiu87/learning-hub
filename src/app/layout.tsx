import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/src/components/theme-provider";
import { Toaster } from "sonner";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "English Learning Hub",
  description: "Created by NMH",
  generator: "eng.learning.hub",
  // icons:
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <main>{children}</main>
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              style: { background: "#1f2937", color: "#fff", borderRadius: 8 },
              duration: 3000,
            }}
          />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
