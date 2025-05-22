"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { LabSelector } from "@/src/components/lab-selector"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { SearchIcon, PlusIcon, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/src/hooks/use-toast"
import { 
  getActiveLoans, 
  getOverdueLoans, 
  updateLoan,
  type LoanFromApi 
} from "@/src/services/loanService"

export default function ActiveLoansPage() {
  const { toast } = useToast()
  const [selectedLab, setSelectedLab] = useState("fisica")
  const [searchQuery, setSearchQuery] = useState("")
  const [loans, setLoans] = useState<LoanFromApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingLoan, setUpdatingLoan] = useState<string | null>(null)

  // Cargar préstamos activos
  const fetchLoans = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Obtener préstamos activos y vencidos
      const [activeLoans, overdueLoans] = await Promise.all([
        getActiveLoans(),
        getOverdueLoans()
      ])
      
      // Combinar préstamos activos y vencidos
      const allLoans = [...activeLoans, ...overdueLoans]
      
      // Si hay un laboratorio seleccionado, filtrar por laboratorio
      const filteredLoans = selectedLab 
        ? allLoans.filter(loan => 
            loan.equipo_id.laboratorio_id.nombre.toLowerCase() === selectedLab.toLowerCase() ||
            loan.equipo_id.laboratorio_id._id === selectedLab
          )
        : allLoans
      
      setLoans(filteredLoans)
    } catch (err) {
      console.error("Error al cargar préstamos:", err)
      setError(err instanceof Error ? err.message : "Error al cargar préstamos")
      toast({
        title: "Error",
        description: "No se pudieron cargar los préstamos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Cargar préstamos cuando cambie el laboratorio seleccionado
  useEffect(() => {
    fetchLoans()
  }, [selectedLab])

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

  // Marcar préstamo como devuelto
  const handleCompleteLoan = async (loanId: string) => {
    try {
      setUpdatingLoan(loanId)
      
      await updateLoan(loanId, {
        estado: 'devuelto',
        // Agregar fecha de devolución real
      })
      
      toast({
        title: "Préstamo completado",
        description: `El préstamo ha sido marcado como devuelto exitosamente.`,
      })
      
      // Recargar préstamos
      await fetchLoans()
    } catch (err) {
      console.error("Error al completar préstamo:", err)
      toast({
        title: "Error",
        description: "No se pudo completar el préstamo",
        variant: "destructive",
      })
    } finally {
      setUpdatingLoan(null)
    }
  }

  // Determinar si un préstamo está vencido
  const isOverdue = (loan: LoanFromApi) => {
    return loan.estado === 'vencido' || new Date(loan.fecha_devolucion) < new Date()
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
        <DashboardHeader heading="Préstamos activos" text="Cargando préstamos...">
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
        <DashboardHeader heading="Préstamos activos" text="Error al cargar préstamos">
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
        heading="Préstamos activos" 
        text={`Gestiona los préstamos activos del laboratorio seleccionado.`}
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
              <CardTitle>Préstamos activos ({filteredLoans.length})</CardTitle>
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
                      <p className="text-sm text-muted-foreground">
                        ID Usuario: {loan.usuario_id._id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {loan.usuario_id.correo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isOverdue(loan) ? "destructive" : "default"}>
                      {isOverdue(loan) ? "Vencido" : "Activo"}
                    </Badge>
                    <div className="text-right text-sm">
                      <p>
                        <span className="font-medium">ID Préstamo:</span> {loan._id}
                      </p>
                      <p>
                        <span className="font-medium">Fecha préstamo:</span>{" "}
                        {formatDate(loan.fecha_prestamo)}
                      </p>
                      <p>
                        <span className="font-medium">Devolver antes de:</span>{" "}
                        {formatDate(loan.fecha_devolucion)}
                      </p>
                      {loan.fecha_devolucion_real && (
                        <p>
                          <span className="font-medium">Devuelto:</span>{" "}
                          {formatDate(loan.fecha_devolucion_real)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-md bg-muted p-3">
                  <h4 className="mb-2 font-medium">Equipo prestado</h4>
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

                {loan.estado !== 'devuelto' && (
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1" 
                      onClick={() => handleCompleteLoan(loan._id)}
                      disabled={updatingLoan === loan._id}
                    >
                      {updatingLoan === loan._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Marcar como devuelto
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {filteredLoans.length === 0 && !loading && (
              <div className="flex h-32 items-center justify-center rounded-lg border">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "No se encontraron préstamos que coincidan con la búsqueda." 
                      : "No hay préstamos activos en este momento."
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