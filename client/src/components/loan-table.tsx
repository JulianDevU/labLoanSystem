"use client"

import { useState, useEffect } from "react"
import { ModalBase } from "@/src/components/modal"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import Image from "next/image"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/src/hooks/use-toast"
import { 
  getActiveLoans, 
  getOverdueLoans, 
  updateLoan,
  type LoanFromApi 
} from "@/src/services/loanService"
import { useTranslations } from "next-intl"

const BASE_URL = process.env.NEXT_PUBLIC_BACK_ENV

// Componente para mostrar la imagen de evidencia con fallback
function EvidenciaFoto({ evidencia_foto }: { evidencia_foto?: string }) {
  const t = useTranslations("EvidenciaFoto")
  const [imgSrc, setImgSrc] = useState<string | undefined>(evidencia_foto);
  const [modalOpen, setModalOpen] = useState(false);

  // Detectar si es base64
  let isBase64 = false;
  if (imgSrc && imgSrc.startsWith("data:image")) isBase64 = true;

  // Construir la URL si es relativa
  let displayUrl = imgSrc;
  if (imgSrc && !isBase64 && !imgSrc.startsWith("http")) {
    displayUrl = `${BASE_URL}/${imgSrc.replace(/^\/+/, "")}`;
  }

  if (!imgSrc) {
    return (
      <div className="h-16 w-24 flex items-center justify-center bg-muted rounded border">
        <span className="text-xs text-muted-foreground">{t("noPhoto")}</span>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative h-16 w-24 rounded overflow-hidden border bg-white cursor-pointer"
        onClick={() => setModalOpen(true)}
        title={t("viewImageTitle")}
      >
        <Image
          src={displayUrl || "/placeholder.jpg"}
          alt={t("altTextThumbnail")}
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
              alt={t("altTextModal")}
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
              {t("closeButton")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

interface LoansTableProps {
  lab: string
  searchQuery: string
}

export function LoansTable({ lab, searchQuery }: LoansTableProps) {
  const { toast } = useToast()
  const [loans, setLoans] = useState<LoanFromApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingLoan, setUpdatingLoan] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<LoanFromApi | null>(null)
  const [equiposDevueltos, setEquiposDevueltos] = useState<{ equipo_id: string, cantidad: number }[]>([])
  const [notaDevolucion, setNotaDevolucion] = useState("")
  const t = useTranslations("LoansTable")

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
      const filteredLoans = lab 
        ? allLoans.filter(loan => {
            const matchById = loan.laboratorio_id._id === lab
            const matchByName = loan.laboratorio_id.nombre?.toLowerCase().includes(lab.toLowerCase())
            return matchById || matchByName
          })
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
  }, [lab])

  // Filtrar préstamos basado en la búsqueda
  const filteredLoans = loans.filter((loan) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      loan._id.toLowerCase().includes(searchLower) ||
      loan.nombre_beneficiado.toLowerCase().includes(searchLower) ||
      loan.correo_beneficiado.toLowerCase().includes(searchLower) ||
      loan.numero_identificacion.toLowerCase().includes(searchLower) ||
      // Buscar en todos los equipos del préstamo
      loan.equipos.some(equipo => 
        equipo.equipo_id.nombre.toLowerCase().includes(searchLower) ||
        equipo.equipo_id.categoria.toLowerCase().includes(searchLower)
      )
    )
  })

  // Abrir modal para devolución
  const openReturnModal = (loan: LoanFromApi) => {
    setSelectedLoan(loan)
    setEquiposDevueltos(loan.equipos.map(eq => ({ equipo_id: eq.equipo_id._id, cantidad: eq.cantidad })))
    setNotaDevolucion("")
    setModalOpen(true)
  }

  // Manejar cambio de cantidad devuelta
  const handleCantidadDevuelta = (equipo_id: string, value: number) => {
    setEquiposDevueltos(prev => prev.map(eq => eq.equipo_id === equipo_id ? { ...eq, cantidad: value } : eq))
  }

  // Confirmar devolución
  const handleConfirmReturn = async () => {
    if (!selectedLoan) return
    setUpdatingLoan(selectedLoan._id)
    try {
      await updateLoan(selectedLoan._id, {
        estado: 'devuelto',
        equipos_devueltos: equiposDevueltos,
        nota_devolucion: notaDevolucion
      })
      toast({
        title: "Préstamo completado",
        description: `El préstamo ha sido marcado como devuelto exitosamente.`,
      })
      setModalOpen(false)
      setSelectedLoan(null)
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

  // Contar total de equipos en un préstamo
  const getTotalEquipmentCount = (equipos: LoanFromApi['equipos']) => {
    return equipos.reduce((total, equipo) => total + equipo.cantidad, 0)
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
          <p className="text-sm text-muted-foreground">{t("errorLoadingLoansDescription")}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={fetchLoans}>
            {t("retryButton")}
          </Button>
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
                    {loan.tipo_beneficiado === 'estudiante' ? t("beneficiaryTypeStudent") : t("beneficiaryTypeProfessor")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {loan.correo_beneficiado}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isOverdue(loan) ? "destructive" : "default"}>
                {isOverdue(loan) ? t("statusOverdue") : t("statusActive")}
              </Badge>
              <div className="text-right text-sm">
                <p>
                  <span className="font-medium">{t("loanId")}</span> {loan._id}
                </p>
                <p>
                  <span className="font-medium">{t("loanDate")}</span>{" "}
                  {formatDate(loan.fecha_prestamo)}
                </p>
                <p>
                  <span className="font-medium">{t("returnBefore")}</span>{" "}
                  {formatDate(loan.fecha_devolucion)}
                </p>
                {loan.fecha_devolucion_real && (
                  <p>
                    <span className="font-medium">{t("returned")}</span>{" "}
                    {formatDate(loan.fecha_devolucion_real)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-md bg-muted p-3">
            <h4 className="mb-2 font-medium">
              {t("equipmentBorrowedTitle", { count: getTotalEquipmentCount(loan.equipos) })}
            </h4>
            <div className="space-y-3">
              {loan.equipos.map((equipo, index) => (
                <div key={index} className="border-l-2 border-primary/20 pl-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {equipo.equipo_id.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">{t("equipmentId")}</span> {equipo.equipo_id._id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">{t("equipmentCategory")}</span> {equipo.equipo_id.categoria}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">{t("equipmentLaboratory")}</span> {equipo.equipo_id.laboratorio_id.nombre}
                      </p>
                      {equipo.equipo_id.descripcion && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">{t("equipmentDescription")}</span> {equipo.equipo_id.descripcion}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {t("equipmentQuantity")} {equipo.cantidad}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 pt-3 border-t border-muted-foreground/20">
              <p className="text-sm">
                <span className="font-medium">{t("loanLaboratory")}</span> {loan.laboratorio_id.nombre}
              </p>
              {loan.descripcion && (
                <p className="text-sm mt-1">
                  <span className="font-medium">{t("loanDescription")}</span> {loan.descripcion}
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
                onClick={() => openReturnModal(loan)}
                disabled={updatingLoan === loan._id}
              >
                <CheckCircle2 className="h-4 w-4" />
                {t("markAsReturnedButton")}
              </Button>
            </div>
          )}

      {/* Modal para devolución parcial y nota */}
      <ModalBase open={modalOpen} onOpenChange={setModalOpen} title={t("returnModalTitle")}>
        {selectedLoan && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">{t("returnModalQuantityTitle")}</h4>
              {selectedLoan.equipos.map((eq, idx) => (
                <div key={eq.equipo_id._id} className="flex items-center gap-2 mb-2">
                  <span className="w-40 truncate">{eq.equipo_id.nombre}</span>
                  <Input
                    type="number"
                    min={0}
                    max={eq.cantidad}
                    value={equiposDevueltos.find(e => e.equipo_id === eq.equipo_id._id)?.cantidad ?? eq.cantidad}
                    onChange={e => handleCantidadDevuelta(eq.equipo_id._id, Math.max(0, Math.min(Number(e.target.value), eq.cantidad)))}
                    className="w-24"
                  />
                  <span className="text-xs text-muted-foreground">{t("returnModalOf")} {eq.cantidad}</span>
                </div>
              ))}
            </div>
            <div>
              <label className="block font-medium mb-1">{t("returnModalNoteLabel")}</label>
              <Textarea
                value={notaDevolucion}
                onChange={e => setNotaDevolucion(e.target.value)}
                placeholder={t("returnModalNotePlaceholder")}
                className="w-full"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={updatingLoan !== null}>{t("returnModalCancel")}</Button>
              <Button onClick={handleConfirmReturn} disabled={updatingLoan !== null}>
                {updatingLoan ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} {t("returnModalConfirm")}
              </Button>
            </div>
          </div>
        )}
      </ModalBase>
        </div>
      ))}

      {filteredLoans.length === 0 && !loading && (
        <div className="flex h-32 items-center justify-center rounded-lg border">
          <div className="text-center">
            <p className="text-muted-foreground">
              {searchQuery 
                ? t("noLoansFoundSearch")
                : t("noActiveLoans")
              }
            </p>
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2" 
                onClick={() => {}}
              >
                {t("clearSearchButton")}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}