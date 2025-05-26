"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Input } from "@/src/components/ui/input"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { OverviewStats } from "@/src/components/overview-stats"
import { LabSelector } from "@/src/components/lab-selector"
import { InventoryTable } from "@/src/components/inventory-table" // Asegúrate de que la ruta sea correcta
import { useRequireAuth } from "@/src/hooks/useRequireAuth"
import { Search } from "lucide-react"
import { LoansTable } from "@/src/components/loan-table"
import { LoansHistoryTable } from "@/src/components/loan-history-table"
import { useTranslations } from "next-intl"

export default function DashboardPage() {
  useRequireAuth()
  const [selectedLab, setSelectedLab] = useState("fisica")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter] = useState("todos")
  const t = useTranslations('Dashboard')
  const l = useTranslations("Laboratory")

  const getLabName = (lab: string) => {
    switch (lab) {
      case "fisica": return l('physics')
      case "telecomunicaciones": l('telecommunications')
      case "software": return l('software')
      default: return lab
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={t('title')} text={t('subtitle')}>
        <LabSelector value={selectedLab} onValueChange={setSelectedLab} />
      </DashboardHeader>
      <div className="grid gap-4 md:gap-8">
        <OverviewStats lab={selectedLab} />
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t('tabOverview')}</TabsTrigger>
            <TabsTrigger value="loans">{t('tabLoans')}</TabsTrigger>
            <TabsTrigger value="inventory">{t('tabInventory')}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 w-full">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>{t('recentLoansTitle')}</CardTitle>
                  <CardDescription>
                    {t('recentLoansDescription', { lab: getLabName(selectedLab) })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LoansHistoryTable lab={selectedLab} searchQuery={searchQuery} timeFilter="30days" statusFilter={statusFilter} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="loans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('activeLoansTitle')}</CardTitle>
                <CardDescription>
                  {t('activeLoansDescription', { lab: getLabName(selectedLab) })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoansTable lab={selectedLab} searchQuery={searchQuery} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('inventoryTitle')}</CardTitle>
                <CardDescription>
                  {t('inventoryDescription', { lab: getLabName(selectedLab) })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Barra de búsqueda */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <InventoryTable lab={selectedLab} searchQuery={searchQuery} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}