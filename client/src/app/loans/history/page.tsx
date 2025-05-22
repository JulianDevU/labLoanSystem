"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { LabSelector } from "@/src/components/lab-selector"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { SearchIcon, Download, Loader2, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { useToast } from "@/src/hooks/use-toast"
import {
  getLoans,
  generateLoansReport,
  type LoanFromApi
} from "@/src/services/loanService"

export default function LoanHistoryPage() {
  const { toast } = useToast()
  const [selectedLab, setSelectedLab] = useState("fisica")
  const [searchQuery, setSearchQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState("all")
  const [loans, setLoans] = useState<LoanFromApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingReport, setGeneratingReport] = useState(false)

  // Cargar historial de préstamos
  const fetchLoans = async () => {
    try {
      setLoading(true)
      setError(null)

      // Configurar filtros para obtener todos los préstamos
      const filters: any = {
        todos: true // Para obtener todos los préstamos del laboratorio
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

      // Obtener todos los préstamos
      const allLoans = await getLoans(filters)

      // Filtrar por laboratorio si está seleccionado
      const filteredLoans = selectedLab
        ? allLoans.filter(loan =>
          loan.equipo_id.laboratorio_id.nombre.toLowerCase() === selectedLab.toLowerCase() ||
          loan.equipo_id.laboratorio_id._id === selectedLab
        )
        : allLoans

      setLoans(filteredLoans)
    } catch (err) {
      console.error("Error al cargar historial:", err)
      setError(err instanceof Error ? err.message : "Error al cargar historial")
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de préstamos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Cargar préstamos cuando cambien los filtros
  useEffect(() => {
    fetchLoans()
  }, [selectedLab, timeFilter])

  // Filtrar préstamos basado en la búsqueda
  const filteredLoans = loans.filter((loan) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      loan._id.toLowerCase().includes(searchLower) ||
      loan.usuario_id.nombre.toLowerCase().includes(searchLower) ||
      loan.usuario_id.correo.toLowerCase().includes(searchLower) ||
      loan.equipo_id.nombre.toLowerCase().includes(searchLower) ||
      loan.equipo_id.categoria.toLowerCase().includes(searchLower)
    )
  })

  // Generar reporte en Excel
  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true)

      const filters: any = {}

      // Filtro por laboratorio
      if (selectedLab) {
        // Aquí necesitarías el ID del laboratorio, asumiendo que lo tienes
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

  // Obtener badge de estado
  const getStatusBadge = (loan: LoanFromApi) => {
    const isLate = loan.fecha_devolucion_real &&
      new Date(loan.fecha_devolucion_real) > new Date(loan.fecha_devolucion)
    const isOverdue = loan.estado === 'vencido'

    if (loan.estado === 'devuelto') {
      if (isLate) {
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Completado Tarde
          </Badge>
        )
      }
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Completado
        </Badge>
      )
    }

    if (isOverdue) {
      return (
        <Badge variant="destructive">
          Vencido
        </Badge>
      )
    }

    return (
      <Badge variant="default">
        Activo
      </Badge>
    )
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  // Obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  if (loading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Historial de Préstamos" text="Cargando historial...">
          <LabSelector value={selectedLab} onValueChange={setSelectedLab} />
        </DashboardHeader>

        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Historial de Préstamos" text="Error al cargar historial">
          <LabSelector value={selectedLab} onValueChange={setSelectedLab} />
        </DashboardHeader>

        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={fetchLoans}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardShell>
    )
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
              <CardTitle>Historial de Préstamos ({filteredLoans.length})</CardTitle>
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

          <div className="space-y-4">
            {filteredLoans.map((loan) => (
              <div key={loan._id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(loan.usuario_id.nombre)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{loan.usuario_id.nombre}</h3>
                        <Badge variant="outline">
                          {loan.usuario_id.tipo === 'estudiante' ? 'Estudiante' : 'Profesor'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">ID: {loan.usuario_id._id}</p>
                      <p className="text-sm text-muted-foreground">{loan.usuario_id.correo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(loan)}
                    <div className="text-right text-sm">
                      <p>
                        <span className="font-medium">ID Préstamo:</span> {loan._id}
                      </p>
                      {loan.fecha_devolucion_real ? (
                        <p>
                          <span className="font-medium">Devuelto:</span>{" "}
                          {formatDate(loan.fecha_devolucion_real)}
                        </p>
                      ) : (
                        <p>
                          <span className="font-medium">Fecha límite:</span>{" "}
                          {formatDate(loan.fecha_devolucion)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-md bg-muted p-3">
                  <h4 className="mb-2 font-medium">Equipo</h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Nombre:</span> {loan.equipo_id.nombre}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">ID Equipo:</span> {loan.equipo_id._id}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Categoría:</span> {loan.equipo_id.categoria}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Laboratorio:</span> {loan.equipo_id.laboratorio_id.nombre}
                    </p>
                    {loan.equipo_id.descripcion && (
                      <p className="text-sm">
                        <span className="font-medium">Descripción:</span> {loan.equipo_id.descripcion}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-muted-foreground sm:grid-cols-2">
                  <div>
                    <p>
                      <span className="font-medium">Fecha de Préstamo:</span>{" "}
                      {formatDate(loan.fecha_prestamo)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>
                      <span className="font-medium">Devolución Esperada:</span>{" "}
                      {formatDate(loan.fecha_devolucion)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {filteredLoans.length === 0 && !loading && (
              <div className="flex h-32 items-center justify-center rounded-lg border">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "No se encontraron préstamos que coincidan con la búsqueda."
                      : "No se encontraron préstamos en el historial."
                    }
                  </p>
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => setSearchQuery("")}
                    >
                      Limpiar búsqueda
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}