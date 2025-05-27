"use client"

import { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { ScrollArea } from "@/src/components/ui/scroll-area" // Ya estás usando esta, ¡excelente!
import { Separator } from "@/src/components/ui/separator"
import { Plus, Minus, X } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"
import { useTranslations } from "next-intl"

interface Equipment {
  id: string
  name: string
  quantity: number
}

// Support both single and multiple selection
interface EquipmentSelectorProps {
  lab: string
  value: Equipment[] | string
  onChange: (value: Equipment[] | string) => void
  single?: boolean // New prop to determine single vs multiple selection
}

export function EquipmentSelector({ lab, value, onChange, single = false }: EquipmentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [equipment, setEquipment] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations('EquipmentSelector')

  useEffect(() => {
    setLoading(true)
    setError(null)
    import("@/src/services/equipmentService").then(({ getEquipment }) => {
      getEquipment()
        .then((data) => {
          // Filtrado robusto: por _id, slug o nombre (consistente con InventoryTable)
          const filtered = data.filter((item: any) => {
            const matchById = item.laboratorio_id?._id === lab
            const matchBySlug = item.laboratorio_id?.slug === lab
            const matchByName = item.laboratorio_id?.nombre?.toLowerCase().includes(lab.toLowerCase())
            return (matchById || matchBySlug || matchByName) && item.cantidad_disponible > 0
          })
          setEquipment(filtered)
        })
        .catch(() => {
          setError("Error al cargar equipos")
        })
        .finally(() => setLoading(false))
    })
  }, [lab])

  const currentEquipment = equipment.map((item) => ({
    id: item._id,
    name: item.nombre,
    available: item.cantidad_disponible ?? 0,
  }))

  // Filtrar por búsqueda
  const filteredEquipment = currentEquipment.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle single selection mode
  if (single) {
    const selectedEquipmentId = typeof value === 'string' ? value : ''
    const selectedEquipment = selectedEquipmentId
      ? currentEquipment.find(item => item.id === selectedEquipmentId)
      : null

    const selectEquipment = (id: string) => {
      onChange(id)
    }

    const clearSelection = () => {
      onChange('')
    }

    if (loading) {
      return <p className="text-center text-muted-foreground">{t("loadingEquipment")}</p>
    }
    if (error) {
      return <p className="text-center text-red-500">{t("errorLoadingEquipment")}</p>
    }

    return (
      <div className="space-y-4">
        {selectedEquipment && (
          <div className="space-y-2">
            <Label>{t("selectedEquipment")}</Label>
            <div className="rounded-md border p-2">
              <div className="flex items-center justify-between gap-2 rounded-md border p-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedEquipment.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedEquipment.id}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={clearSelection}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">{t("remove")}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>{t("availableEquipment")}</Label>
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Card>
            <CardContent className="p-2">
              {/* Aquí está el cambio clave: el ScrollArea ya tiene 'h-60' */}
              <ScrollArea className="h-60 pr-4"> 
                <div className="space-y-2">
                  {filteredEquipment.map((item) => {
                    const isSelected = selectedEquipmentId === item.id

                    return (
                      <div key={item.id}>
                        <div className="flex items-center justify-between py-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">{item.id}</p>
                              <Badge variant="outline" className="text-xs">
                                {item.available} {t("available")}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant={isSelected ? "default" : "ghost"}
                            size="sm"
                            className="h-8 gap-1"
                            disabled={item.available === 0}
                            onClick={() => selectEquipment(item.id)}
                          >
                            {isSelected ? t("selected") : (
                              <>
                                <Plus className="h-4 w-4" />
                                {t("select")}
                              </>
                            )}
                          </Button>
                        </div>
                        <Separator />
                      </div>
                    )
                  })}
                  {filteredEquipment.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">{t("noElementsFound")}</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Original multiple selection logic
  const equipmentArray = Array.isArray(value) ? value : []

  // Solo permite añadir si no se excede el stock disponible
  const addEquipment = (id: string, name: string) => {
    const item = currentEquipment.find(eq => eq.id === id)
    if (!item) return;
    const existingItem = equipmentArray.find((e) => e.id === id)
    const available = item.available;
    const selectedQuantity = existingItem ? existingItem.quantity : 0;
    if (selectedQuantity >= available) return; // No permitir más de lo disponible
    if (existingItem) {
      onChange(equipmentArray.map((e) => (e.id === id ? { ...e, quantity: e.quantity + 1 } : e)))
    } else {
      onChange([...equipmentArray, { id, name, quantity: 1 }])
    }
  }

  const removeEquipment = (id: string) => {
    onChange(equipmentArray.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    const item = currentEquipment.find(eq => eq.id === id)
    if (!item) return;
    const available = item.available;
    if (newQuantity < 1) {
      removeEquipment(id)
      return
    }
    if (newQuantity > available) {
      newQuantity = available;
    }
    onChange(equipmentArray.map((e) => (e.id === id ? { ...e, quantity: newQuantity } : e)))
  }

  if (loading) {
    return <p className="text-center text-muted-foreground">{t("loadingEquipment")}</p>
  }
  if (error) {
    return <p className="text-center text-red-500">{t("errorLoadingEquipment")}</p>
  }

  return (
    <div className="space-y-4">
      {equipmentArray.length > 0 && (
        <div className="space-y-2">
          <Label>{t("selectedEquipment")}</Label>
          {/* Aplica ScrollArea al contenedor de equipos seleccionados si es necesario */}
          <div className="rounded-md border p-2 max-h-48 overflow-y-auto"> 
            <div className="space-y-2">
              {equipmentArray.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.id}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                      <span className="sr-only">{t("decrease")}</span>
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                      className="h-7 w-14 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={(() => {
                        const eq = currentEquipment.find(eq => eq.id === item.id);
                        return eq ? item.quantity >= eq.available : false;
                      })()}
                    >
                      <Plus className="h-3 w-3" />
                      <span className="sr-only">{t("increase")}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => removeEquipment(item.id)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">{t("remove")}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>{t("availableEquipment")}</Label>
        <Input placeholder={t("searchPlaceholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <Card>
          <CardContent className="p-2">
            {/* El ScrollArea ya tiene 'h-60' */}
            <ScrollArea className="h-60 pr-4"> 
              <div className="space-y-2">
                {filteredEquipment.map((item) => {
                  const isSelected = equipmentArray.some((selected) => selected.id === item.id)
                  const selectedQuantity = isSelected
                    ? equipmentArray.find((selected) => selected.id === item.id)?.quantity || 0
                    : 0
                  const remainingQuantity = item.available - selectedQuantity

                  return (
                    <div key={item.id}>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">{item.id}</p>
                            <Badge variant="outline" className="text-xs">
                              {remainingQuantity} {t("available")}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1"
                          disabled={remainingQuantity === 0}
                          onClick={() => addEquipment(item.id, item.name)}
                        >
                          <Plus className="h-4 w-4" />
                          {t("add")}
                        </Button>
                      </div>
                      <Separator />
                    </div>
                  )
                })}
                {filteredEquipment.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">{t("noElementsFound")}</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}