"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { BeakerIcon } from "@/src/components/icons"
import { useToast } from "@/src/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al Sistema de Gestión de Préstamos de Laboratorio",
      })
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 font-bold">
        <BeakerIcon className="h-6 w-6" />
        <span>LabLoanSystem</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Iniciar sesión</CardTitle>
          <CardDescription className="text-center">Ingresa tus credenciales para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="staff" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="staff" className="w-full">Personal</TabsTrigger>
            </TabsList>
            <TabsContent value="staff">
              <form onSubmit={handleLogin}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" placeholder="ejemplo@correo.com" required />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Contraseña</Label>
                      <Link href="/forgot-password" className="text-sm text-muted-foreground hover:underline">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <Input id="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="mt-2 text-xs text-center text-muted-foreground">
            Al iniciar sesión, aceptas nuestros {" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Términos de servicio
            </Link>{" "}
            y {" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Política de privacidad
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
