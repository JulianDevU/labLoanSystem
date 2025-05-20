"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { useRequireAuth } from "@/src/hooks/useRequireAuth"

export default function SettingsPage() {
  useRequireAuth()

  const [tab, setTab] = useState("account")

  return (
    <DashboardShell>
      <DashboardHeader heading="Configuración" text="Administra tus preferencias y seguridad.">
        {/* Puedes agregar botones o selectores aquí si quieres */}
      </DashboardHeader>

      <div className="grid gap-4 md:gap-8">
        <Tabs defaultValue={tab} onValueChange={setTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="account">Cuenta</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="preferences">Preferencias</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cambiar contraseña</CardTitle>
                <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Aquí un formulario para cambiar contraseña */}
                <form className="space-y-4">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Contraseña actual</label>
                    <input
                      type="password"
                      id="current-password"
                      name="current-password"
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                      placeholder="********"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
                    <input
                      type="password"
                      id="new-password"
                      name="new-password"
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                      placeholder="********"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
                    <input
                      type="password"
                      id="confirm-password"
                      name="confirm-password"
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                      placeholder="********"
                    />
                  </div>
                  <button type="submit" className="mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Guardar cambios
                  </button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>Configura cómo y cuándo recibir notificaciones.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Ejemplo simple con checkboxes */}
                <form className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="email-notifications" name="email-notifications" />
                    <label htmlFor="email-notifications" className="text-sm">Notificaciones por correo electrónico</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="sms-notifications" name="sms-notifications" />
                    <label htmlFor="sms-notifications" className="text-sm">Notificaciones por SMS</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="push-notifications" name="push-notifications" />
                    <label htmlFor="push-notifications" className="text-sm">Notificaciones push</label>
                  </div>
                  <button type="submit" className="mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Guardar preferencias
                  </button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias Generales</CardTitle>
                <CardDescription>Ajusta las preferencias generales de tu cuenta.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Aquí puedes agregar selects, switches, etc */}
                <form className="space-y-4">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700">Idioma</label>
                    <select id="language" name="language" className="mt-1 block w-full rounded-md border border-gray-300 p-2">
                      <option value="es">Español</option>
                      <option value="en">Inglés</option>
                      <option value="fr">Francés</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-700">Tema</label>
                    <select id="theme" name="theme" className="mt-1 block w-full rounded-md border border-gray-300 p-2">
                      <option value="light">Claro</option>
                      <option value="dark">Oscuro</option>
                      <option value="system">Sistema</option>
                    </select>
                  </div>
                  <button type="submit" className="mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Guardar preferencias
                  </button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
