import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { FileSpreadsheet, Package, AlertTriangle } from "lucide-react"
import { getActiveLoans, getLoans } from "@/src/services/loanService"
import { getEquipment } from "@/src/services/equipmentService"
import { useToast } from "@/src/hooks/use-toast"
import { useTranslations } from "next-intl"

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
  const t = useTranslations("OverviewStats")

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchStats() {
      try {
        const [allLoans, equipment] = await Promise.all([
          getLoans({ todos: true }),
          getEquipment()
        ]);
        if (!isMounted) return;

        const filterByLab = (arr: any[]) => arr.filter(loan => {
          const matchById = loan.laboratorio_id?._id === lab;
          const matchBySlug = loan.laboratorio_id?.slug === lab;
          const matchByName = loan.laboratorio_id?.nombre?.toLowerCase().includes(lab.toLowerCase());
          return matchById || matchBySlug || matchByName;
        });

        const filteredLoans = filterByLab(allLoans);
        const active = filteredLoans.filter(loan => loan.estado === 'activo');
        setActiveLoans(active.length);

        const now = new Date();
        const overdue = filteredLoans.filter(loan =>
          loan.estado === 'vencido' ||
          (loan.estado === 'activo' && new Date(loan.fecha_devolucion) < now)
        );
        setOverdueLoans(overdue.length);

        const filteredEquipment = equipment.filter((item: any) => {
          const matchById = item.laboratorio_id?._id === lab;
          const matchBySlug = item.laboratorio_id?.slug === lab;
          const matchByName = item.laboratorio_id?.nombre?.toLowerCase().includes(lab.toLowerCase());
          return matchById || matchBySlug || matchByName;
        });
        setInventoryItems(filteredEquipment.length);

      } catch (err: any) {
        if (!isMounted) return;
        setError(t("errorLoadingStats"));
        toast({
          title: t("errorLoadingStats"),
          description: err.message || t("errorLoadingStats"),
          variant: "destructive"
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStats();
    return () => { isMounted = false; };
  }, [lab, toast, t]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardContent className="py-8 text-center">{t("loadingStats")}</CardContent></Card>
        <Card><CardContent className="py-8 text-center">{t("loadingStats")}</CardContent></Card>
        <Card><CardContent className="py-8 text-center">{t("loadingStats")}</CardContent></Card>
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
          <CardTitle className="text-sm font-medium">{t("activeLoansTitle")}</CardTitle>
          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeLoans}</div>
          <p className="text-xs text-muted-foreground">{t("activeLoansDescription")}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("inventoryItemsTitle")}</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inventoryItems}</div>
          <p className="text-xs text-muted-foreground">{t("inventoryItemsDescription")}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("overdueLoansTitle")}</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overdueLoans}</div>
          <p className="text-xs text-muted-foreground">{t("overdueLoansDescription")}</p>
        </CardContent>
      </Card>
    </div>
  );
}