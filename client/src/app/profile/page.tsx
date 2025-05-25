"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { useRequireAuth } from "@/src/hooks/useRequireAuth"
import { getUser } from "@/src/services/userService"
import { Button } from "@/src/components/ui/button"

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
                    </TabsList>

                    <TabsContent value="personal" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información Básica</CardTitle>
                                <CardDescription>Detalles sobre tu cuenta y datos personales.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">Nombre: {user?.nombre}</p>
                                <p className="text-sm">Correo: {user?.correo}</p>
                                <p className="text-sm">Rol: {user?.tipo}</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <div className="grid gap-4">
                        <TabsContent value="personal" className="space-y-4">
                            <div className="flex gap-4 flex-wrap">
                                <Card className="flex-1 min-w-[300px]">
                                    <CardHeader>
                                        <CardTitle>Manual de usuario</CardTitle>
                                        <CardDescription>Aqui tienes un manual de usuario para manejar la pagina.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <a href="../../../public/MANUAL_USUARIO.pdf" download>
                                            <Button variant="outline">
                                                Descargar manual
                                            </Button>
                                        </a>
                                    </CardContent>
                                </Card>

                                <Card className="flex-1 min-w-[300px]">
                                    <CardHeader>
                                        <CardTitle>Manual tecnico</CardTitle>
                                        <CardDescription>Aqui tienes un manual tecnico para saber lo que contiene la pagina.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <a href="../../../public/MANUAL_TECNICO.pdf" download>
                                            <Button variant="outline">
                                                Descargar manual
                                            </Button>
                                        </a>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </DashboardShell>
    )
}
