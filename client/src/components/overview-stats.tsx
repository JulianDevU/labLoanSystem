import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { FileSpreadsheet, Package, AlertTriangle } from "lucide-react"
import { getActiveLoans, getLoans } from "@/src/services/loanService"
import { getEquipment } from "@/src/services/equipmentService"
import { useToast } from "@/src/hooks/use-toast"

interface OverviewStatsProps {
  lab: string
}

export function OverviewStats({ lab }: OverviewStatsProps) {
  const { toast } = useToast();
  const [activeLoans, setActiveLoans] = useState<number | null>(null);
  const [overdueLoans, setOverdueLoans] = useState<number | null>(null);
  const [inventoryItems, setInventoryItems] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchStats() {
      try {
        // Obtener todos los préstamos activos y vencidos de una sola vez
        const [allLoans, equipment] = await Promise.all([
          getLoans({ todos: true }), // Obtenemos todos los préstamos
          getEquipment()
        ]);

        if (!isMounted) return;

        // Filtrar por laboratorio
        const filterByLab = (arr: any[]) => arr.filter(loan => {
          const matchById = loan.laboratorio_id?._id === lab;
          const matchBySlug = loan.laboratorio_id?.slug === lab;
          const matchByName = loan.laboratorio_id?.nombre?.toLowerCase().includes(lab.toLowerCase());
          return matchById || matchBySlug || matchByName;
        });

        const filteredLoans = filterByLab(allLoans);
        
        // Contar préstamos activos
        const active = filteredLoans.filter(loan => loan.estado === 'activo');
        setActiveLoans(active.length);

        // Contar préstamos vencidos (incluyendo los que están activos pero con fecha pasada)
        const now = new Date();
        const overdue = filteredLoans.filter(loan => 
          loan.estado === 'vencido' || 
          (loan.estado === 'activo' && new Date(loan.fecha_devolucion) < now)
        );
        setOverdueLoans(overdue.length);

        // Filtrar equipos por laboratorio
        const filteredEquipment = equipment.filter((item: any) => {
          const matchById = item.laboratorio_id?._id === lab;
          const matchBySlug = item.laboratorio_id?.slug === lab;
          const matchByName = item.laboratorio_id?.nombre?.toLowerCase().includes(lab.toLowerCase());
          return matchById || matchBySlug || matchByName;
        });
        setInventoryItems(filteredEquipment.length);

      } catch (err: any) {
        if (!isMounted) return;
        setError("No se pudieron cargar las estadísticas");
        toast({
          title: "Error",
          description: err.message || "No se pudieron cargar las estadísticas",
          variant: "destructive"
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStats();
    return () => { isMounted = false; };
  }, [lab, toast]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardContent className="py-8 text-center">Cargando estadísticas...</CardContent></Card>
        <Card><CardContent className="py-8 text-center">Cargando estadísticas...</CardContent></Card>
        <Card><CardContent className="py-8 text-center">Cargando estadísticas...</CardContent></Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardContent className="py-8 text-center text-destructive">{error}</CardContent></Card>
        <Card><CardContent className="py-8 text-center text-destructive">{error}</CardContent></Card>
        <Card><CardContent className="py-8 text-center text-destructive">{error}</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Préstamos activos</CardTitle>
          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeLoans}</div>
          <p className="text-xs text-muted-foreground">Equipos actualmente en préstamo</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Equipos en inventario</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inventoryItems}</div>
          <p className="text-xs text-muted-foreground">Total de equipos en inventario</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Préstamos vencidos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overdueLoans}</div>
          <p className="text-xs text-muted-foreground">Préstamos fuera de fecha de devolución</p>
        </CardContent>
      </Card>
    </div>
  );
}