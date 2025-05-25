"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { useRequireAuth } from "@/src/hooks/useRequireAuth"
import { useToast } from "@/src/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { changePassword } from "@/src/services/authService"
import { ModalBase } from "@/src/components/modal"

// Schema de validación para cambio de contraseña
const changePasswordSchema = z.object({
  contrasenaActual: z.string().min(1, "La contraseña actual es obligatoria"),
  nuevaContrasena: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmarContrasena: z.string().min(1, "Confirma tu nueva contraseña")
}).refine((data) => data.nuevaContrasena === data.confirmarContrasena, {
  message: "Las contraseñas no coinciden",
  path: ["confirmarContrasena"]
})


type ChangePasswordSchema = z.infer<typeof changePasswordSchema>

export default function SettingsPage() {
  useRequireAuth()

  const { toast } = useToast()
  const [tab, setTab] = useState("account")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema)
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [modalInfo, setModalInfo] = useState({
    title: "",
    description: ""
  })

  const onPasswordSubmit = async (data: ChangePasswordSchema) => {
    setIsChangingPassword(true)

    try {
      await changePassword({
        contrasenaActual: data.contrasenaActual,
        nuevaContrasena: data.nuevaContrasena,
        confirmarContrasena: data.confirmarContrasena
      })

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente.",
      })

      setModalInfo({
        title: "Éxito",
        description: "Tu contraseña ha sido cambiada exitosamente."
      })
      setModalOpen(true)

      resetPasswordForm()

    } catch (error: any) {
      toast({
        title: "Error al cambiar contraseña",
        description: error.message || "Hubo un problema al cambiar tu contraseña",
        variant: "destructive",
      })

      setModalInfo({
        title: "Error",
        description: error.message || "Hubo un problema al cambiar tu contraseña."
      })
      setModalOpen(true)

    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Configuración" text="Administra tus preferencias y seguridad.">
        {/* Puedes agregar botones o selectores aquí si quieres */}
      </DashboardHeader>

      <div className="grid gap-4 md:gap-8">
        <Tabs defaultValue={tab} onValueChange={setTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="account">Cuenta</TabsTrigger>
            <TabsTrigger value="preferences">Preferencias</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cambiar contraseña</CardTitle>
                <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contrasenaActual">Contraseña actual*</Label>
                    <Input
                      id="contrasenaActual"
                      type="password"
                      {...registerPassword("contrasenaActual")}
                      placeholder="********"
                    />
                    {passwordErrors.contrasenaActual && (
                      <p className="text-sm text-red-500">{passwordErrors.contrasenaActual.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="nuevaContrasena">Nueva contraseña*</Label>
                    <Input
                      id="nuevaContrasena"
                      type="password"
                      {...registerPassword("nuevaContrasena")}
                      placeholder="********"
                    />
                    {passwordErrors.nuevaContrasena && (
                      <p className="text-sm text-red-500">{passwordErrors.nuevaContrasena.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmarContrasena">Confirmar nueva contraseña*</Label>
                    <Input
                      id="confirmarContrasena"
                      type="password"
                      {...registerPassword("confirmarContrasena")}
                      placeholder="********"
                    />
                    {passwordErrors.confirmarContrasena && (
                      <p className="text-sm text-red-500">{passwordErrors.confirmarContrasena.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? "Cambiando contraseña..." : "Cambiar contraseña"}
                  </Button>
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
                <form className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="language">Idioma</Label>
                    <select
                      id="language"
                      name="language"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="es">Español</option>
                      <option value="en">Inglés</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full">
                    Guardar preferencias
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <ModalBase
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={modalInfo.title}
          description={modalInfo.description}
        />
      </div>
    </DashboardShell>
  )
}