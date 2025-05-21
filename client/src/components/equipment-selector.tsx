"use client"

import { useState } from "react"
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

  // This would normally fetch data from an API
  const availableEquipment = {
    fisica: [
      { id: "PH001", name: "Osciloscopio Digital", available: 5 },
      { id: "PH002", name: "Generador de Funciones", available: 3 },
      { id: "PH003", name: "Multímetro Digital", available: 10 },
      { id: "PH004", name: "Kit de Láser", available: 2 },
      { id: "PH005", name: "Banco Óptico", available: 3 },
      { id: "PH006", name: "Kit de Componentes de Circuito", available: 15 },
      { id: "PH007", name: "Sensor de Fuerza", available: 5 },
    ],
    telecomunicacion: [
      { id: "TC001", name: "Analizador de Espectro", available: 2 },
      { id: "TC002", name: "Analizador de Red", available: 2 },
      { id: "TC003", name: "Router", available: 5 },
      { id: "TC004", name: "Switch", available: 8 },
      { id: "TC005", name: "Kit de Fibra Óptica", available: 3 },
      { id: "TC006", name: "Kit de Antenas", available: 4 },
    ],
    software: [
      { id: "SW001", name: "Raspberry Pi", available: 8 },
      { id: "SW002", name: "Kit de Arduino", available: 10 },
      { id: "SW003", name: "Kit de Sensores", available: 5 },
      { id: "SW004", name: "Visor de Realidad Virtual", available: 2 },
      { id: "SW005", name: "Tableta Gráfica", available: 4 },
    ],
  }

  const currentEquipment = availableEquipment[lab as keyof typeof availableEquipment] || []

  // Filter equipment based on search query
  const filteredEquipment = currentEquipment.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()),
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
