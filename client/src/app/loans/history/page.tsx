"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { LabSelector } from "@/src/components/lab-selector"
import { SearchIcon, Download, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { useToast } from "@/src/hooks/use-toast"
import { generateLoansReport } from "@/src/services/loanService"
import { LoansHistoryTable } from "@/src/components/loan-history-table"

export default function LoanHistoryPage() {
  const { toast } = useToast()
  const [selectedLab, setSelectedLab] = useState("fisica")
  const [searchQuery, setSearchQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState("all")
  const [generatingReport, setGeneratingReport] = useState(false)

  // Generar reporte en Excel
  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true)

      const filters: any = {}

      // Filtro por laboratorio
      if (selectedLab) {
        filters.laboratorio_id = selectedLab
      }

      // Filtro por tiempo
      if (timeFilter !== "all") {
        const now = new Date()
        if (timeFilter === "30days") {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          filters.desde = thirtyDaysAgo.toISOString()
        } else if (timeFilter === "90days") {
          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          filters.desde = ninetyDaysAgo.toISOString()
        }
      }

      const report = await generateLoansReport(filters)

      // Crear enlace de descarga
      const link = document.createElement('a')
      link.href = `http://localhost:5000${report.url}`
      link.download = report.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Reporte generado",
        description: `Se ha generado el reporte con ${report.count} préstamos`,
      })
    } catch (err) {
      console.error("Error al generar reporte:", err)
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive",
      })
    } finally {
      setGeneratingReport(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Historial de Préstamos"
        text={`Consulta todos los préstamos del laboratorio seleccionado.`}
      >
        <LabSelector value={selectedLab} onValueChange={setSelectedLab} />
      </DashboardHeader>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Historial de Préstamos</CardTitle>
              <CardDescription>Visualiza todos los préstamos de equipos completados y activos.</CardDescription>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleGenerateReport}
              disabled={generatingReport}
            >
              {generatingReport ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Exportar a Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar en el historial..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tiempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el tiempo</SelectItem>
                <SelectItem value="30days">Últimos 30 días</SelectItem>
                <SelectItem value="90days">Últimos 90 días</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <LoansHistoryTable 
            lab={selectedLab} 
            searchQuery={searchQuery}
            timeFilter={timeFilter}
          />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}