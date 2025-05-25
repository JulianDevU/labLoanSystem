"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { DashboardNav } from "@/src/components/dashboard-nav"

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="md:hidden p-2">
          <Menu className="w-6 h-6" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-0 top-0 bottom-0 w-64 bg-background z-50 p-4 shadow-lg">
          <Dialog.Title className="sr-only">Menú</Dialog.Title>
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-lg">Menú</span>
            <button onClick={() => setOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <DashboardNav />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
