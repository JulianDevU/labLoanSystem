import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet, Package, AlertTriangle, Clock } from "lucide-react"

interface OverviewStatsProps {
  lab: string
}

export function OverviewStats({ lab }: OverviewStatsProps) {
  // This would normally fetch data from an API
  const stats = {
    fisica: {
      activeLoans: 12,
      inventoryItems: 87,
      overdueLoans: 3,
      averageLoanDuration: "4 días",
    },
    telecomunicaciones: {
      activeLoans: 8,
      inventoryItems: 64,
      overdueLoans: 1,
      averageLoanDuration: "6 días",
    },
    software: {
      activeLoans: 15,
      inventoryItems: 42,
      overdueLoans: 2,
      averageLoanDuration: "3 días",
    },
  }

  const currentStats = stats[lab as keyof typeof stats]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Préstamos activos</CardTitle>
          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStats.activeLoans}</div>
          <p className="text-xs text-muted-foreground">Equipos actualmente en préstamo</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Equipos en inventario</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStats.inventoryItems}</div>
          <p className="text-xs text-muted-foreground">Total de equipos en inventario</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Préstamos vencidos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStats.overdueLoans}</div>
          <p className="text-xs text-muted-foreground">Préstamos fuera de fecha de devolución</p>
        </CardContent>
      </Card>
    </div>
  )
}
