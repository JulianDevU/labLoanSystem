"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { BeakerIcon } from "@/src/components/icons"
import { login } from "@/src/services/loginService"
import { useTranslations } from "next-intl"
import { ModalBase } from "@/src/components/modal"

export default function LoginPage() {
  const router = useRouter()
  const t = useTranslations('Login')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalInfo, setModalInfo] = useState({
    title: "",
    description: ""
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const correo = emailRef.current?.value || ""
    const contrasena = passwordRef.current?.value || ""

    try {
      await login({ correo, contrasena })
      setModalInfo({
        title: t('successTitle'),
        description: t('successDescription'),
      })
      setModalOpen(true)

      setTimeout(() => {
        router.push("/dashboard")
      }, 2500)
    } catch (error: any) {
      setModalInfo({
        title: t('successTitle'),
        description: error.message || t('errorDefault'),
      })
      setModalOpen(true)
    }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 font-bold">
        <BeakerIcon className="h-6 w-6" />
        <span>LabLoanSystem</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{t('title')}</CardTitle>
          <CardDescription className="text-center">{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="staff" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="staff" className="w-full">{t('staff')}</TabsTrigger>
            </TabsList>
            <TabsContent value="staff">
              <form onSubmit={handleLogin}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t('emailLabel')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      required
                      ref={emailRef}
                      autoComplete="username"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t('passwordLabel')}</Label>
                      <Link href="/forgot-password" className="text-sm text-muted-foreground hover:underline">
                        {t('forgotPassword')}
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      ref={passwordRef}
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('buttonLoading') : t('button')}
                  </Button>
                  {error && (
                    <p className="text-sm text-red-500 text-center mt-2">{error}</p>
                  )}
                </div>
              </form>
              <div className="mt-2 flex flex-col items-center">
                <Link href="/register" className="text-sm mt-3 text-muted-foreground hover:underline">
                  {t('noAccount')}
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="mt-2 text-xs text-center text-muted-foreground">
            {t('termsNotice')}{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              {t('termsLink')}
            </Link>{" "}
            y {" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              {t('privacyLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
      <ModalBase
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={modalInfo.title}
        description={modalInfo.description}
      />
    </div>
  )
}