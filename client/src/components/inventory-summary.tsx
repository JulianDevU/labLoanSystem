import { Progress } from "@/src/components/ui/progress"
import { useEffect, useState } from "react"
import { getEquipment } from "@/src/services/equipmentService"
import { useToast } from "@/src/hooks/use-toast"
import { useTranslations } from "next-intl"

interface InventorySummaryProps {
  lab: string
}

interface EquipmentItem {
  _id: string
  nombre: string
  cantidad_total: number
  cantidad_disponible: number
  categoria: string
}

export function InventorySummary({ lab }: InventorySummaryProps) {
  const { toast } = useToast()
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const t = useTranslations("InventorySummary")

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true)
        const data = await getEquipment()
        
        // Filtrar equipos por laboratorio seleccionado
        const filteredEquipment = data.filter((item: any) => {
          const matchById = item.laboratorio_id?._id === lab
          const matchBySlug = item.laboratorio_id?.slug === lab
          const matchByName = item.laboratorio_id?.nombre?.toLowerCase().includes(lab.toLowerCase())
          return matchById || matchBySlug || matchByName
        })

        // Ordenar por nombre y limitar a 5 equipos para el resumen
        const sortedEquipment = filteredEquipment
          .sort((a: any, b: any) => a.nombre.localeCompare(b.nombre))
          .slice(0, 5)
          .map((item: any) => ({
            _id: item._id,
            nombre: item.nombre,
            cantidad_total: item.cantidad_total,
            cantidad_disponible: item.cantidad_disponible,
            categoria: item.categoria
          }))

        setEquipment(sortedEquipment)
      } catch (error) {
        console.error("Error al cargar equipos:", error)
        toast({
          title: t("errorTitle"),
          description: t("errorDescription"),
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEquipment()
  }, [lab, toast, t])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("loading")}</span>
              <span className="text-sm text-muted-foreground">0/0 {t("available")}</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        ))}
      </div>
    )
  }

  if (equipment.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-4">
        {t("noEquipmentFound")}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {equipment.map((item) => (
        <div key={item._id} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{item.nombre}</span>
            <span className="text-sm text-muted-foreground">
              {item.cantidad_disponible}/{item.cantidad_total} {t("available")}
            </span>
          </div>
          <Progress 
            value={(item.cantidad_disponible / item.cantidad_total) * 100} 
            className="h-2" 
          />
          <div className="text-xs text-muted-foreground">
            {t("category")}: {item.categoria}
          </div>
        </div>
      ))}
    </div>
  )
}