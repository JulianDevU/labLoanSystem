"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { LabSelector } from "@/src/components/lab-selector"
import { SearchIcon, PlusIcon } from "lucide-react"
import { LoansTable } from "@/src/components/loan-table"

export default function ActiveLoansPage() {
  const [selectedLab, setSelectedLab] = useState("fisica")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Préstamos activos" 
        text={`Gestiona los préstamos activos del laboratorio de ${selectedLab}.`}
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <LabSelector value={selectedLab} onValueChange={setSelectedLab} />
          <Button asChild>
            <Link href="/loans/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              Nuevo préstamo
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Préstamos activos</CardTitle>
              <CardDescription>
                Visualiza y gestiona todos los préstamos de equipos actuales.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, usuario, equipo..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <LoansTable lab={selectedLab} searchQuery={searchQuery} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}