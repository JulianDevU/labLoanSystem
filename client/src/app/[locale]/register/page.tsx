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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { getRegisterSchema, RegisterSchema } from "@/src/components/utils/validators"
import { registerUser } from "@/src/services/userService"
import { useTranslations } from "next-intl"
import { ModalBase } from "@/src/components/modal"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('Register')
  const l= useTranslations('Validation')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalInfo, setModalInfo] = useState({
    title: "",
    description: ""
  })

  const registerSchema = getRegisterSchema(l)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterSchema) => {
    setIsLoading(true)

    try {
      await registerUser({
        nombre: data.name,
        correo: data.email,
        contrasena: data.password
      })

      setModalInfo({
        title: t('successTitle'),
        description: t('successDescription'),
      })
      setModalOpen(true)

      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      setModalInfo({
        title: t('error'),
        description: error.message || t('errorDefault'),
      })
      setModalOpen(true)

    } finally {
      setIsLoading(false)
    }
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
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t('nameLabel')}</Label>
                  <Input id="name" {...register("name")} placeholder={t('namePlaceholder')} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">{t('emailLabel')}</Label>
                  <Input id="email" type="email" {...register("email")} placeholder={t('emailPlaceholder')} />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">{t('passwordLabel')}</Label>
                  <Input id="password" type="password" {...register("password")} />
                  {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
                  <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('buttonLoading') : t('button')}
                </Button>
              </form>
              <div className="mt-2 flex flex-col items-center">
                <Link href="/login" className="text-sm mt-3 text-muted-foreground hover:underline">
                  {t('alreadyAccount')}
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="mt-2 text-xs text-center text-muted-foreground">
            {t('termsNotice')}{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              {t('termsLink')}
            </Link>{" "}
            y{" "}
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
