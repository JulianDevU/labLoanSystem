"use client"

import { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Separator } from "@/src/components/ui/separator"
import { Plus, Minus, X } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"

interface Equipment {
  id: string
  name: string
  quantity: number
}

interface EquipmentSelectorProps {
  lab: string
  value: Equipment[]
  onChange: (value: Equipment[]) => void
}


export function EquipmentSelector({ lab, value, onChange }: EquipmentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [equipment, setEquipment] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const addEquipment = (id: string, name: string) => {
    const existingItem = value.find((item) => item.id === id)

    if (existingItem) {
      onChange(value.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      onChange([...value, { id, name, quantity: 1 }])
    }
  }

  const removeEquipment = (id: string) => {
    onChange(value.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeEquipment(id)
      return
    }

    onChange(value.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  if (loading) {
    return <p className="text-center text-muted-foreground">Cargando equipos...</p>
  }
  if (error) {
    return <p className="text-center text-red-500">{error}</p>
  }

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Equipment</Label>
          <div className="rounded-md border p-2">
            <div className="space-y-2">
              {value.map((item) => (
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
                      <span className="sr-only">Decrease</span>
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
                    >
                      <Plus className="h-3 w-3" />
                      <span className="sr-only">Increase</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => removeEquipment(item.id)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Equipos Disponibles</Label>
        <Input placeholder="Buscar equipo..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <Card>
          <CardContent className="p-2">
            <ScrollArea className="h-60 pr-4">
              <div className="space-y-2">
                {filteredEquipment.map((item) => {
                  const isSelected = value.some((selected) => selected.id === item.id)
                  const selectedQuantity = isSelected
                    ? value.find((selected) => selected.id === item.id)?.quantity || 0
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
                              {remainingQuantity} disponibles
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
                          Agregar
                        </Button>
                      </div>
                      <Separator />
                    </div>
                  )
                })}
                {filteredEquipment.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">No equipment found.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
