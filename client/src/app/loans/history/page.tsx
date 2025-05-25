"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { LabSelector } from "@/src/components/lab-selector"
import { SearchIcon, Loader2, FileSpreadsheet, BarChart3 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { useToast } from "@/src/hooks/use-toast"
import { LoansHistoryTable } from "@/src/components/loan-history-table"
import { exportLoansSummaryToExcel, exportLoansToExcel } from "@/src/services/exportExcelService"

export default function LoanHistoryPage() {
  const { toast } = useToast()
  const [selectedLab, setSelectedLab] = useState("fisica")
  const [searchQuery, setSearchQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [exportingDetailed, setExportingDetailed] = useState(false)
  const [exportingSummary, setExportingSummary] = useState(false)

  // Construir filtros para la exportación
  const buildFilters = () => {
    const filters: any = {}

    // Filtro por laboratorio
    if (selectedLab && selectedLab !== "todos") {
      filters.laboratorio_id = selectedLab
    }

    // Filtro por estado
    if (statusFilter && statusFilter !== "todos") {
      filters.estado = statusFilter
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
      } else if (timeFilter === "year") {
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        filters.desde = oneYearAgo.toISOString()
      }
    }

    return filters
  }

  // Exportar historial completo en Excel
  const handleExportDetailed = async () => {
    try {
      setExportingDetailed(true)

      const filters = buildFilters()
      console.log("Exportando con filtros:", filters)

      await exportLoansToExcel(filters)

      toast({
        title: "Exportación exitosa",
        description: "El historial detallado de préstamos se ha descargado correctamente",
      })
    } catch (err) {
      console.error("Error al exportar historial:", err)
      const errorMessage = err instanceof Error ? err.message : "No se pudo exportar el historial"
      toast({
        title: "Error en la exportación",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setExportingDetailed(false)
    }
  }

  // Exportar resumen estadístico en Excel
  const handleExportSummary = async () => {
    try {
      setExportingSummary(true)

      const filters = buildFilters()
      console.log("Exportando resumen con filtros:", filters)

      await exportLoansSummaryToExcel(filters)

      toast({
        title: "Resumen exportado",
        description: "El resumen estadístico se ha descargado correctamente",
      })
    } catch (err) {
      console.error("Error al exportar resumen:", err)
      const errorMessage = err instanceof Error ? err.message : "No se pudo exportar el resumen"
      toast({
        title: "Error en la exportación",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setExportingSummary(false)
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleExportSummary}
                disabled={exportingSummary || exportingDetailed}
              >
                {exportingSummary ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4" />
                )}
                Resumen
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleExportDetailed}
                disabled={exportingDetailed || exportingSummary}
              >
                {exportingDetailed ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                Exportar Detallado
              </Button>
            </div>
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
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="devuelto">Devueltos</SelectItem>
                  <SelectItem value="vencido">Vencidos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tiempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo el tiempo</SelectItem>
                  <SelectItem value="30days">Últimos 30 días</SelectItem>
                  <SelectItem value="90days">Últimos 90 días</SelectItem>
                  <SelectItem value="year">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border bg-muted/30 p-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4" />
              <div className="flex-1">
                <p className="font-medium">Opciones de Exportación:</p>
                <p className="text-xs">
                  <strong>Detallado:</strong> Incluye todos los préstamos con información completa de equipos y fechas.
                  <br />
                  <strong>Resumen:</strong> Estadísticas agrupadas por laboratorio, estado y tipo de beneficiado.
                </p>
              </div>
            </div>
          </div>

          <LoansHistoryTable
            lab={selectedLab}
            searchQuery={searchQuery}
            timeFilter={timeFilter}
            statusFilter={statusFilter}
          />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}