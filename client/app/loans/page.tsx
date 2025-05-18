"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { LabSelector } from "@/components/lab-selector"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchIcon, PlusIcon, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ActiveLoansPage() {
  const { toast } = useToast()
  const [selectedLab, setSelectedLab] = useState("physics")
  const [searchQuery, setSearchQuery] = useState("")

  // This would normally fetch data from an API
  const activeLoans = {
    physics: [
      {
        id: "PH-1001",
        beneficiary: {
          name: "Maria Garcia",
          type: "student",
          email: "m.garcia@example.com",
          id: "S12345",
        },
        items: [
          { name: "Oscilloscope", id: "PH001", quantity: 1 },
          { name: "Function Generator", id: "PH002", quantity: 1 },
        ],
        date: "2024-05-14T10:30:00",
        returnDate: "2024-05-18T16:00:00",
        status: "active",
      },
      {
        id: "PH-1002",
        beneficiary: {
          name: "James Wilson",
          type: "teacher",
          email: "j.wilson@example.com",
          id: "T54321",
        },
        items: [
          { name: "Laser Kit", id: "PH004", quantity: 1 },
          { name: "Optical Bench", id: "PH005", quantity: 1 },
        ],
        date: "2024-05-13T14:15:00",
        returnDate: "2024-05-20T12:00:00",
        status: "active",
      },
      {
        id: "PH-1003",
        beneficiary: {
          name: "Sofia Martinez",
          type: "student",
          email: "s.martinez@example.com",
          id: "S67890",
        },
        items: [{ name: "Digital Multimeter", id: "PH003", quantity: 1 }],
        date: "2024-05-12T09:45:00",
        returnDate: "2024-05-15T17:00:00",
        status: "overdue",
      },
    ],
    telecommunications: [
      {
        id: "TC-2001",
        beneficiary: {
          name: "David Chen",
          type: "student",
          email: "d.chen@example.com",
          id: "S23456",
        },
        items: [
          { name: "Spectrum Analyzer", id: "TC001", quantity: 1 },
          { name: "Signal Generator", id: "TC002", quantity: 1 },
        ],
        date: "2024-05-14T11:00:00",
        returnDate: "2024-05-21T16:00:00",
        status: "active",
      },
      {
        id: "TC-2002",
        beneficiary: {
          name: "Emily Johnson",
          type: "teacher",
          email: "e.johnson@example.com",
          id: "T65432",
        },
        items: [{ name: "Network Analyzer", id: "TC002", quantity: 1 }],
        date: "2024-05-10T13:30:00",
        returnDate: "2024-05-17T12:00:00",
        status: "active",
      },
    ],
    software: [
      {
        id: "SW-3001",
        beneficiary: {
          name: "Michael Brown",
          type: "student",
          email: "m.brown@example.com",
          id: "S34567",
        },
        items: [
          { name: "Development Board", id: "SW001", quantity: 1 },
          { name: "Sensor Kit", id: "SW003", quantity: 1 },
        ],
        date: "2024-05-14T09:00:00",
        returnDate: "2024-05-16T17:00:00",
        status: "active",
      },
      {
        id: "SW-3002",
        beneficiary: {
          name: "Sarah Davis",
          type: "student",
          email: "s.davis@example.com",
          id: "S45678",
        },
        items: [
          { name: "Raspberry Pi", id: "SW001", quantity: 1 },
          { name: "Arduino Kit", id: "SW002", quantity: 1 },
        ],
        date: "2024-05-13T10:45:00",
        returnDate: "2024-05-15T16:30:00",
        status: "overdue",
      },
      {
        id: "SW-3003",
        beneficiary: {
          name: "Robert Taylor",
          type: "teacher",
          email: "r.taylor@example.com",
          id: "T76543",
        },
        items: [
          { name: "VR Headset", id: "SW004", quantity: 1 },
          { name: "Graphics Tablet", id: "SW005", quantity: 1 },
        ],
        date: "2024-05-11T14:00:00",
        returnDate: "2024-05-18T12:00:00",
        status: "active",
      },
    ],
  }

  const currentLoans = activeLoans[selectedLab as keyof typeof activeLoans]

  // Filter loans based on search query
  const filteredLoans = currentLoans.filter(
    (loan) =>
      loan.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.beneficiary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.beneficiary.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleCompleteLoan = (loanId: string) => {
    // Aquí normalmente se llamaría a una API para completar el préstamo
    toast({
      title: "Préstamo completado",
      description: `El préstamo ${loanId} ha sido marcado como devuelto y se han enviado notificaciones.`,
    })
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Préstamos activos" text={`Gestiona los préstamos activos del laboratorio de ${selectedLab}.`}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <LabSelector value={selectedLab} onValueChange={setSelectedLab} />
          <Button asChild>
            <Link href="/loans/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              Nuevo préstamo
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Préstamos activos</CardTitle>
              <CardDescription>Visualiza y gestiona todos los préstamos de equipos actuales.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar préstamos..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredLoans.map((loan) => (
              <div key={loan.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt={loan.beneficiary.name} />
                      <AvatarFallback>{loan.beneficiary.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{loan.beneficiary.name}</h3>
                        <Badge variant="outline">{loan.beneficiary.type === 'student' ? 'Estudiante' : 'Profesor'}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">ID: {loan.beneficiary.id}</p>
                      <p className="text-sm text-muted-foreground">{loan.beneficiary.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={loan.status === "overdue" ? "destructive" : "default"}>
                      {loan.status === "overdue" ? "Vencido" : "Activo"}
                    </Badge>
                    <div className="text-right text-sm">
                      <p>
                        <span className="font-medium">ID Préstamo:</span> {loan.id}
                      </p>
                      <p>
                        <span className="font-medium">Devolver antes de:</span>{" "}
                        {new Date(loan.returnDate).toLocaleString("es-MX", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-md bg-muted p-3">
                  <h4 className="mb-2 font-medium">Equipos</h4>
                  <ul className="space-y-1">
                    {loan.items.map((item, index) => (
                      <li key={index} className="text-sm">
                        {item.quantity}x {item.name} (ID: {item.id})
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => handleCompleteLoan(loan.id)}>
                    <CheckCircle2 className="h-4 w-4" />
                    Marcar como devuelto
                  </Button>
                </div>
              </div>
            ))}

            {filteredLoans.length === 0 && (
              <div className="flex h-32 items-center justify-center rounded-lg border">
                <p className="text-muted-foreground">No se encontraron préstamos activos.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
