"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { OverviewStats } from "@/components/overview-stats"
import { RecentLoans } from "@/components/recent-loans"
import { InventorySummary } from "@/components/inventory-summary"
import { LabSelector } from "@/components/lab-selector"

export default function DashboardPage() {
  const [selectedLab, setSelectedLab] = useState("physics")

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
                  <CardDescription>Últimos préstamos de equipos en el laboratorio de {selectedLab}.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentLoans lab={selectedLab} />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Resumen de inventario</CardTitle>
                  <CardDescription>Inventario actual del laboratorio de {selectedLab}.</CardDescription>
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
                <CardDescription>Listado de todos los préstamos de equipos vigentes para el laboratorio de {selectedLab}.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Aquí se implementará la tabla de préstamos activos */}
                <p className="text-sm text-muted-foreground">Aquí se mostrará la tabla detallada de préstamos activos.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inventario</CardTitle>
                <CardDescription>Inventario completo del laboratorio de {selectedLab}.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Aquí se implementará la tabla de inventario */}
                <p className="text-sm text-muted-foreground">Aquí se mostrará la tabla detallada de inventario.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
