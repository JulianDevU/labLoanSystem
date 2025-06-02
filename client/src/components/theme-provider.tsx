"use client"


import { ThemeProvider } from "next-themes"
import { ReactNode } from "react"
import { GlobalLoader } from "./global-loader"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <GlobalLoader />
      {children}
    </ThemeProvider>
  );
}
