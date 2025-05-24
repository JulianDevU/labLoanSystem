"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Input } from "@/src/components/ui/input"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { OverviewStats } from "@/src/components/overview-stats"
import { InventorySummary } from "@/src/components/inventory-summary"
import { LabSelector } from "@/src/components/lab-selector"
import { InventoryTable } from "@/src/components/inventory-table" // Asegúrate de que la ruta sea correcta
import { useRequireAuth } from "@/src/hooks/useRequireAuth"
import { Search } from "lucide-react"
import { LoansTable } from "@/src/components/loan-table"
import { LoansHistoryTable } from "@/src/components/loan-history-table"

export default function DashboardPage() {
  useRequireAuth()
  const [selectedLab, setSelectedLab] = useState("fisica")
  const [searchQuery, setSearchQuery] = useState("")

  const getLabName = (lab: string) => {
    switch (lab) {
      case "fisica": return "Física"
      case "telecomunicaciones": return "Telecomunicaciones"
      case "software": return "Software"
      default: return lab
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Panel de Control" text="Gestiona los préstamos de equipos e inventario en los laboratorios.">
        <LabSelector value={selectedLab} onValueChange={setSelectedLab} />
      </DashboardHeader>
      <div className="grid gap-4 md:gap-8">
        <OverviewStats lab={selectedLab} />
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="loans">Préstamos activos</TabsTrigger>
            <TabsTrigger value="inventory">Inventario</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Préstamos recientes</CardTitle>
                  <CardDescription>
                    Últimos préstamos de equipos en el laboratorio de {getLabName(selectedLab)}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LoansHistoryTable lab={selectedLab} searchQuery={searchQuery} timeFilter="30days"/>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Resumen de inventario</CardTitle>
                  <CardDescription>
                    Inventario actual del laboratorio de {getLabName(selectedLab)}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InventorySummary lab={selectedLab} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="loans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Préstamos activos</CardTitle>
                <CardDescription>
                  Listado de todos los préstamos de equipos vigentes para el laboratorio de {getLabName(selectedLab)}.
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
                <CardTitle>Inventario</CardTitle>
                <CardDescription>
                  Inventario completo del laboratorio de {getLabName(selectedLab)}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Barra de búsqueda */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar equipos por nombre, categoría o ID..."
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