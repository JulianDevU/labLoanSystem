"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { useRequireAuth } from "@/src/hooks/useRequireAuth"
import { getUser } from "@/src/services/userService"

interface User {
    nombre: string
    correo: string
    tipo: string
}

export default function ProfilePage() {
    useRequireAuth()

    const [tab, setTab] = useState("personal")
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
          try {
            const result = await getUser()
            setUser(result)
          } catch (error) {
            console.error("Error al obtener usuario", error)
          }
        }
    
        fetchUser()
      }, [])

    return (
        <DashboardShell>
            <DashboardHeader heading="Perfil de Usuario" text="Gestiona tu información personal y configuración.">
                {/* Puedes agregar aquí algún selector o botón si es necesario */}
            </DashboardHeader>
            <div className="grid gap-4 md:gap-8">
                <Tabs defaultValue={tab} onValueChange={setTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="personal">Información Personal</TabsTrigger>
                        <TabsTrigger value="settings">Configuración</TabsTrigger>
                        <TabsTrigger value="activity">Actividad</TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información Básica</CardTitle>
                                <CardDescription>Detalles sobre tu cuenta y datos personales.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Aquí puedes poner campos o componentes con la info personal */}
                                <p className="text-sm">Nombre: {user?.nombre}</p>
                                <p className="text-sm">Correo: {user?.correo}</p>
                                <p className="text-sm">Rol: {user?.tipo}</p>
                                {/* Más campos o formulario editable si quieres */}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuración de la Cuenta</CardTitle>
                                <CardDescription>Ajustes y preferencias de usuario.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Aquí puedes poner switches, botones o formularios para configuración */}
                                <p className="text-sm text-muted-foreground">Opciones para notificaciones, cambio de contraseña, etc.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Actividad Reciente</CardTitle>
                                <CardDescription>Registro de las acciones recientes en la plataforma.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Aquí una lista o tabla con actividad */}
                                <p className="text-sm text-muted-foreground">Aquí se mostrará la actividad reciente del usuario.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardShell>
    )
}
