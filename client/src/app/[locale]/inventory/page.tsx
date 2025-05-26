"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { LabSelector } from "@/src/components/lab-selector"
import { InventoryTable } from "@/src/components/inventory-table"
import { PlusIcon, SearchIcon } from "lucide-react"
import { useTranslations } from "next-intl"

export default function InventoryPage() {
  const [selectedLab, setSelectedLab] = useState("fisica")
  const [searchQuery, setSearchQuery] = useState("")
  const t = useTranslations("Inventory")
  const l = useTranslations("Laboratory")

  const getLabName = (lab: string) => {
    switch (lab) {
      case "fisica": return l("physics")
      case "telecomunicaciones": return l("telecommunications")
      case "software": return l("software")
      default: return lab
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={t("title")}
        text={t("subtitle", { lab: getLabName(selectedLab) })}
      >
        <LabSelector value={selectedLab} onValueChange={setSelectedLab} />
      </DashboardHeader>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t("cardTitle")}</CardTitle>
              <CardDescription>{t("cardDescription")}</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href="/inventory/new">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  {t("addButton")}
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <InventoryTable lab={selectedLab} searchQuery={searchQuery} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
