"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { LabSelector } from "@/src/components/lab-selector"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { SearchIcon, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

export default function LoanHistoryPage() {
  const [selectedLab, setSelectedLab] = useState("physics")
  const [searchQuery, setSearchQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState("all")

  // This would normally fetch data from an API
  const loanHistory = {
    physics: [
      {
        id: "PH-0987",
        beneficiary: {
          name: "Alex Johnson",
          type: "student",
          email: "a.johnson@example.com",
          id: "S12340",
        },
        items: [
          { name: "Digital Multimeter", id: "PH003", quantity: 1 },
          { name: "Circuit Components Kit", id: "PH006", quantity: 1 },
        ],
        date: "2024-05-01T09:30:00",
        returnDate: "2024-05-05T16:00:00",
        actualReturnDate: "2024-05-05T15:45:00",
        status: "completed",
      },
      {
        id: "PH-0986",
        beneficiary: {
          name: "Emma Thompson",
          type: "teacher",
          email: "e.thompson@example.com",
          id: "T54320",
        },
        items: [
          { name: "Oscilloscope", id: "PH001", quantity: 1 },
          { name: "Function Generator", id: "PH002", quantity: 1 },
        ],
        date: "2024-04-25T13:15:00",
        returnDate: "2024-04-28T12:00:00",
        actualReturnDate: "2024-04-28T11:30:00",
        status: "completed",
      },
      {
        id: "PH-0985",
        beneficiary: {
          name: "Carlos Rodriguez",
          type: "student",
          email: "c.rodriguez@example.com",
          id: "S67891",
        },
        items: [{ name: "Force Sensor", id: "PH007", quantity: 2 }],
        date: "2024-04-20T10:45:00",
        returnDate: "2024-04-22T17:00:00",
        actualReturnDate: "2024-04-23T09:15:00",
        status: "completed-late",
      },
    ],
    telecommunications: [
      {
        id: "TC-1987",
        beneficiary: {
          name: "Linda Kim",
          type: "student",
          email: "l.kim@example.com",
          id: "S23457",
        },
        items: [
          { name: "Router", id: "TC003", quantity: 1 },
          { name: "Switch", id: "TC004", quantity: 1 },
        ],
        date: "2024-05-02T11:00:00",
        returnDate: "2024-05-09T16:00:00",
        actualReturnDate: "2024-05-09T15:30:00",
        status: "completed",
      },
      {
        id: "TC-1986",
        beneficiary: {
          name: "Thomas Wright",
          type: "teacher",
          email: "t.wright@example.com",
          id: "T65433",
        },
        items: [{ name: "Fiber Optic Kit", id: "TC005", quantity: 1 }],
        date: "2024-04-18T13:30:00",
        returnDate: "2024-04-25T12:00:00",
        actualReturnDate: "2024-04-25T11:45:00",
        status: "completed",
      },
    ],
    software: [
      {
        id: "SW-2987",
        beneficiary: {
          name: "Olivia Parker",
          type: "student",
          email: "o.parker@example.com",
          id: "S34568",
        },
        items: [
          { name: "Arduino Kit", id: "SW002", quantity: 1 },
          { name: "Sensor Kit", id: "SW003", quantity: 1 },
        ],
        date: "2024-05-03T09:00:00",
        returnDate: "2024-05-06T17:00:00",
        actualReturnDate: "2024-05-06T16:45:00",
        status: "completed",
      },
      {
        id: "SW-2986",
        beneficiary: {
          name: "Daniel Lee",
          type: "student",
          email: "d.lee@example.com",
          id: "S45679",
        },
        items: [{ name: "Raspberry Pi", id: "SW001", quantity: 1 }],
        date: "2024-04-22T10:45:00",
        returnDate: "2024-04-24T16:30:00",
        actualReturnDate: "2024-04-26T10:15:00",
        status: "completed-late",
      },
      {
        id: "SW-2985",
        beneficiary: {
          name: "Jennifer Adams",
          type: "teacher",
          email: "j.adams@example.com",
          id: "T76544",
        },
        items: [
          { name: "VR Headset", id: "SW004", quantity: 1 },
          { name: "Graphics Tablet", id: "SW005", quantity: 1 },
        ],
        date: "2024-04-15T14:00:00",
        returnDate: "2024-04-22T12:00:00",
        actualReturnDate: "2024-04-22T11:30:00",
        status: "completed",
      },
    ],
  }

  const currentHistory = loanHistory[selectedLab as keyof typeof loanHistory] || []

  // Filter loans based on search query and time filter
  const filteredLoans = currentHistory.filter((loan) => {
    const matchesSearch =
      loan.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.beneficiary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.beneficiary.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    if (timeFilter === "all") return true

    const loanDate = new Date(loan.date)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
    const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 60)) // already subtracted 30, so 90 total

    if (timeFilter === "30days") {
      return loanDate >= thirtyDaysAgo
    } else if (timeFilter === "90days") {
      return loanDate >= ninetyDaysAgo
    }

    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      case "completed-late":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Completed Late
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Historial de Préstamos" text={`Consulta los préstamos anteriores para el laboratorio de ${selectedLab}.`}>
        <LabSelector value={selectedLab} onValueChange={setSelectedLab} />
      </DashboardHeader>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Historial de Préstamos</CardTitle>
              <CardDescription>Visualiza todos los préstamos de equipos completados.</CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar a Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar en el historial..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tiempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el tiempo</SelectItem>
                <SelectItem value="30days">Últimos 30 días</SelectItem>
                <SelectItem value="90days">Últimos 90 días</SelectItem>
              </SelectContent>
            </Select>
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
                    {getStatusBadge(loan.status)}
                    <div className="text-right text-sm">
                      <p>
                        <span className="font-medium">ID Préstamo:</span> {loan.id}
                      </p>
                      <p>
                        <span className="font-medium">Devuelto:</span>{" "}
                        {new Date(loan.actualReturnDate).toLocaleString("es-MX", {
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

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p>
                      <span className="font-medium">Fecha de Préstamo:</span>{" "}
                      {new Date(loan.date).toLocaleString("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>
                      <span className="font-medium">Devolución Esperada:</span>{" "}
                      {new Date(loan.returnDate).toLocaleString("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {filteredLoans.length === 0 && (
              <div className="flex h-32 items-center justify-center rounded-lg border">
                <p className="text-muted-foreground">No se encontraron préstamos en el historial.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
