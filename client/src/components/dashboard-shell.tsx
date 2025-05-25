import type { ReactNode } from "react"
import { DashboardNav } from "@/src/components/dashboard-nav"
import { UserNav } from "@/src/components/user-nav"
import { ThemeToggle } from "@/src/components/theme-toggle"
import { BeakerIcon } from "@/src/components/icons"

interface DashboardShellProps {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <BeakerIcon className="h-6 w-6" />
            <span>LabLoanSystem</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex-1 overflow-auto py-4">
              <DashboardNav />
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-5xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
