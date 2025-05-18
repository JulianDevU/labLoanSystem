import { Progress } from "@/components/ui/progress"

interface InventorySummaryProps {
  lab: string
}

export function InventorySummary({ lab }: InventorySummaryProps) {
  // This would normally fetch data from an API
  const inventoryData = {
    physics: [
      { category: "Measurement Tools", total: 30, available: 24 },
      { category: "Optical Equipment", total: 15, available: 12 },
      { category: "Electrical Components", total: 25, available: 22 },
      { category: "Mechanics Equipment", total: 17, available: 15 },
    ],
    telecommunications: [
      { category: "Network Devices", total: 20, available: 16 },
      { category: "Signal Analyzers", total: 12, available: 10 },
      { category: "Communication Equipment", total: 18, available: 14 },
      { category: "Testing Tools", total: 14, available: 12 },
    ],
    software: [
      { category: "Development Boards", total: 15, available: 10 },
      { category: "Sensor Kits", total: 10, available: 8 },
      { category: "VR/AR Equipment", total: 5, available: 3 },
      { category: "Computing Devices", total: 12, available: 9 },
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
              {item.available}/{item.total} available
            </span>
          </div>
          <Progress value={(item.available / item.total) * 100} className="h-2" />
        </div>
      ))}
    </div>
  )
}
