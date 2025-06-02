"use client";
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getLoans } from '@/src/services/loanService';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/components/ui/card';
import { DashboardShell } from '@/src/components/dashboard-shell';
import { DashboardHeader } from '@/src/components/dashboard-header';
import '@/src/styles/calendar-custom.css';
import { useTranslations } from "next-intl";

interface Loan {
  _id: string;
  nombre_beneficiado: string;
  equipos: Array<{ equipo_id: { nombre: string } | string; cantidad: number }>;
  fecha_devolucion: string;
  [key: string]: any;
}

interface LoansByDate {
  [date: string]: Loan[];
}

export default function LoansCalendarPage() {
  const [loansByDate, setLoansByDate] = useState<LoansByDate>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const t = useTranslations("CalendarPage");

  useEffect(() => {
    async function fetchLoans() {
      const loans: Loan[] = await getLoans();
      const grouped: LoansByDate = {};
      loans.forEach((loan) => {
        const date = loan.fecha_devolucion.split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(loan);
      });
      setLoansByDate(grouped);
    }
    fetchLoans();
  }, []);

  function tileContent({ date }: { date: Date }) {
    const key = date.toISOString().split('T')[0];
    const count = loansByDate[key]?.filter((l) => l.estado !== 'devuelto').length || 0;
    if (count > 0) {
      return (
        <div className="calendar-loan-count">
          {count === 1
            ? t("oneLoanDue")
            : t("manyLoansDue", { count })}
        </div>
      );
    }
    return null;
  }

  // Handler para seleccionar día en el calendario
  const onDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const selectedKey = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
  // Solo préstamos no devueltos
  const loansForSelected = selectedKey
    ? (loansByDate[selectedKey]?.filter((l) => l.estado !== 'devuelto') || [])
    : [];

  return (
    <DashboardShell>
      <DashboardHeader
        heading={t("heading")}
        text={t("text")}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t("calendarTitle")}</CardTitle>
          <CardDescription>
            {t("calendarDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
        <div className="flex flex-col items-center min-h-[480px]">
          <Calendar
            onClickDay={onDayClick}
            tileContent={tileContent}
            locale={t("calendarLocale")}
            className="rounded-2xl shadow-xl border border-border bg-card p-6 calendar-custom-md"
            prev2Label={null}
            next2Label={null}
            formatShortWeekday={(locale, date) =>
              t("weekdaysShort", { day: date.getDay() })
            }
            formatMonthYear={(locale, date) =>
              date.toLocaleString(t("calendarLocale"), { month: "long", year: "numeric" })
            }
            tileClassName={({ date, view }) => {
              if (view === 'month') {
                const key = date.toISOString().split('T')[0];
                if (loansByDate[key]?.length) {
                  return 'bg-muted/60 text-primary font-semibold rounded-lg border border-primary/30';
                }
                if (date.getDay() === 0) {
                  return 'text-red-500';
                }
                return 'rounded-lg hover:bg-muted/40 transition-colors';
              }
              return '';
            }}
          />
          {/* Lista de préstamos del día seleccionado */}
          {selectedDate && (
            <div className="w-full max-w-3xl mx-auto mt-8">
              <h3 className="text-lg font-semibold mb-4 text-primary">
                {t("loansDueOn", { date: selectedKey.split('-').reverse().join('/') })}
              </h3>
              <div className="space-y-4">
                {loansForSelected.length === 0 ? (
                  <div className="text-muted-foreground border rounded-lg p-6 text-center bg-muted/40">
                    {t("noLoansForDay")}
                  </div>
                ) : (
                  loansForSelected.map((loan: any) => (
                    <div key={loan._id} className="rounded-lg border p-4 bg-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center gap-2">
                          <Avatar>
                            <AvatarFallback>
                              {(loan.nombre_beneficiado || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0,2)}
                            </AvatarFallback>
                          </Avatar>
                          {loan.evidencia_foto && (
                            <img
                              src={loan.evidencia_foto}
                              alt="Evidencia"
                              className="w-20 h-20 object-cover rounded border"
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{loan.nombre_beneficiado}</h4>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">{loan.numero_identificacion}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{loan.correo_beneficiado}</p>
                          <Badge variant="outline" className="mt-1">
                            {t(`beneficiaryType.${loan.tipo_beneficiado}`)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-1 mt-4 sm:mt-0">
                        <div className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">{t("labLabel")}:</span> {typeof loan.laboratorio_id === 'object' ? loan.laboratorio_id.nombre : loan.laboratorio_id}
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">{t("loanDateLabel")}:</span> {loan.fecha_prestamo ? new Date(loan.fecha_prestamo).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">{t("dueDateLabel")}:</span> {loan.fecha_devolucion ? new Date(loan.fecha_devolucion).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">{t("statusLabel")}:</span> 
                          {(() => {
                            // Si está vencido y no devuelto, mostrar "Vencido" en rojo
                            if (loan.estado === 'activo') {
                              const hoy = new Date();
                              hoy.setHours(0,0,0,0);
                              const fechaVenc = new Date(loan.fecha_devolucion);
                              fechaVenc.setHours(0,0,0,0);
                              if (fechaVenc < hoy) {
                                return (
                                  <Badge variant="destructive" className="ml-1">{t("overdueStatus")}</Badge>
                                );
                              }
                            }
                            return (
                              <Badge variant="default" className="ml-1">
                                {t(`status.${loan.estado}`)}
                              </Badge>
                            );
                          })()}
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">{t("equipmentsLabel")}:</span> {loan.equipos.map((e: any) => {
                            const nombre = typeof e.equipo_id === 'string' ? e.equipo_id : e.equipo_id.nombre;
                            return `${nombre} (x${e.cantidad})`;
                          }).join(', ')}
                        </div>
                        {loan.descripcion && (
                          <div className="text-sm text-muted-foreground mb-1">
                            <span className="font-medium">{t("descriptionLabel")}:</span> {loan.descripcion}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
