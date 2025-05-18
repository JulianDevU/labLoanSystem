import { Progress } from "@/components/ui/progress"

interface InventorySummaryProps {
  lab: string
}

export function InventorySummary({ lab }: InventorySummaryProps) {
  // This would normally fetch data from an API
  const inventoryData = {
    fisica: [
      { category: "Herramientas de Medición", total: 30, available: 24 },
      { category: "Equipos Ópticos", total: 15, available: 12 },
      { category: "Componentes Eléctricos", total: 25, available: 22 },
      { category: "Equipos de Mecánica", total: 17, available: 15 },
    ],
    telecomunicaciones: [
      { category: "Dispositivos de Red", total: 20, available: 16 },
      { category: "Analizadores de Señal", total: 12, available: 10 },
      { category: "Equipos de Comunicación", total: 18, available: 14 },
      { category: "Herramientas de Prueba", total: 14, available: 12 },
    ],
    software: [
      { category: "Placas de Desarrollo", total: 15, available: 10 },
      { category: "Kits de Sensores", total: 10, available: 8 },
      { category: "Equipos VR/AR", total: 5, available: 3 },
      { category: "Dispositivos de Cómputo", total: 12, available: 9 },
    ],
  }

  const currentInventory = inventoryData[lab as keyof typeof inventoryData]

  return (
    <div className="space-y-4">
      {currentInventory.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{item.category}</span>
            <span className="text-sm text-muted-foreground">
              {item.available}/{item.total} disponibles
            </span>
          </div>
          <Progress value={(item.available / item.total) * 100} className="h-2" />
        </div>
      ))}
    </div>
  )
}
