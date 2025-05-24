"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import Image from "next/image"
// Componente para mostrar la imagen de evidencia con fallback
function EvidenciaFoto({ evidencia_foto }: { evidencia_foto?: string }) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(evidencia_foto);
  const [modalOpen, setModalOpen] = useState(false);

  // Detectar si es base64
  let isBase64 = false;
  if (imgSrc && imgSrc.startsWith("data:image")) isBase64 = true;

  // Construir la URL si es relativa
  let displayUrl = imgSrc;
  if (imgSrc && !isBase64 && !imgSrc.startsWith("http")) {
    displayUrl = `http://localhost:5000/${imgSrc.replace(/^\/+/,'')}`;
  }

  if (!imgSrc) {
    return (
      <div className="h-16 w-24 flex items-center justify-center bg-muted rounded border">
        <span className="text-xs text-muted-foreground">Sin foto</span>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative h-16 w-24 rounded overflow-hidden border bg-white cursor-pointer"
        onClick={() => setModalOpen(true)}
        title="Ver imagen en grande"
      >
        <Image
          src={displayUrl || "/placeholder.jpg"}
          alt="Evidencia fotográfica"
          fill
          style={{ objectFit: "cover" }}
          sizes="96px"
          className="rounded"
          onError={() => setImgSrc("/placeholder.jpg")}
        />
      </div>
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setModalOpen(false)}
        >
          <div className="relative bg-white rounded shadow-lg p-4" onClick={e => e.stopPropagation()}>
            <Image
              src={displayUrl || "/placeholder.jpg"}
              alt="Evidencia fotográfica grande"
              width={600}
              height={400}
              style={{ objectFit: "contain", maxHeight: "80vh", maxWidth: "90vw" }}
              className="rounded"
              onError={() => setImgSrc("/placeholder.jpg")}
            />
            <button
              className="absolute top-2 right-2 text-black bg-white rounded-full px-2 py-1 shadow"
              onClick={() => setModalOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
import { Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/src/hooks/use-toast"
import {
  getLoans,
  type LoanFromApi
} from "@/src/services/loanService"

interface LoansTableProps {
  lab: string
  searchQuery: string
  timeFilter: string
}

export function LoansHistoryTable({ lab, searchQuery, timeFilter }: LoansTableProps) {
  const { toast } = useToast()
  const [loans, setLoans] = useState<LoanFromApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      const filteredLoans = lab
        ? allLoans.filter(loan => {
          const matchById = loan.laboratorio_id._id === lab
          const matchByName = loan.laboratorio_id.nombre?.toLowerCase().includes(lab.toLowerCase())
          return matchById || matchByName
        })
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
  }, [lab, timeFilter])

  // Filtrar préstamos basado en la búsqueda
  const filteredLoans = loans.filter((loan) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      loan._id.toLowerCase().includes(searchLower) ||
      loan.nombre_beneficiado.toLowerCase().includes(searchLower) ||
      loan.correo_beneficiado.toLowerCase().includes(searchLower) ||
      loan.numero_identificacion.toLowerCase().includes(searchLower) ||
      loan.equipos.some(equipo =>
        equipo.equipo_id.nombre.toLowerCase().includes(searchLower) ||
        equipo.equipo_id.categoria.toLowerCase().includes(searchLower)
      )
    )
  })

  // Obtener badge de estado - FUNCIÓN MODIFICADA
  const getStatusBadge = (loan: LoanFromApi) => {
    const now = new Date();
    const returnDate = new Date(loan.fecha_devolucion);
    const isLate = loan.fecha_devolucion_real &&
      new Date(loan.fecha_devolucion_real) > returnDate;
    const isOverdue = loan.estado === 'vencido' || 
                     (loan.estado === 'activo' && returnDate < now);

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

  // Resto del código permanece igual...
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
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={fetchLoans}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (filteredLoans.length === 0) {
    return (
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
              onClick={() => {}}
            >
              Limpiar búsqueda
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredLoans.map((loan) => (
        <div key={loan._id} className="rounded-lg border p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <Avatar>
                  <AvatarFallback>
                    {getInitials(loan.nombre_beneficiado)}
                  </AvatarFallback>
                </Avatar>
                <EvidenciaFoto evidencia_foto={loan.evidencia_foto} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{loan.nombre_beneficiado}</h3>
                  <Badge variant="outline">
                    {loan.tipo_beneficiado === 'estudiante' ? 'Estudiante' : 'Profesor'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{loan.correo_beneficiado}</p>
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
            <div className="space-y-3">
              {loan.equipos.map((equipo, index) => (
                <div key={index} className="border-l-2 border-primary/20 pl-3" >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Nombre:</span> {equipo.equipo_id.nombre}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">ID Equipo:</span> {equipo.equipo_id._id}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Categoría:</span> {equipo.equipo_id.categoria}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Laboratorio:</span> {equipo.equipo_id.laboratorio_id.nombre}
                      </p>
                      {
                        equipo.equipo_id.descripcion && (
                          <p className="text-sm">
                            <span className="font-medium">Descripción:</span> {equipo.equipo_id.descripcion}
                          </p>
                        )
                      }
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      Cantidad: {equipo.cantidad}
                    </Badge>
                  </div>
                </div>
              ))}
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
        </div>
      ))}
    </div>
  );
}