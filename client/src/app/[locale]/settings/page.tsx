"use client"

import { useState, useTransition } from "react"
import { useLocale } from "next-intl"
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
import { useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/src/i18n/navigation"

const createChangePasswordSchema = (t: any) => z.object({
  contrasenaActual: z.string().min(1, t('validation.currentPasswordRequired')),
  nuevaContrasena: z.string().min(6, t('validation.newPasswordMinLength')),
  confirmarContrasena: z.string().min(1, t('validation.confirmPasswordRequired'))
}).refine((data) => data.nuevaContrasena === data.confirmarContrasena, {
  message: t('validation.passwordsNotMatch'),
  path: ["confirmarContrasena"]
})

export default function SettingsPage() {
  useRequireAuth()

  const { toast } = useToast()
  const t = useTranslations("Settings")
  const [tab, setTab] = useState("account")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isPending, startTransition] = useTransition();

  const changePasswordSchema = createChangePasswordSchema(t)
  type ChangePasswordSchema = z.infer<typeof changePasswordSchema>

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema)
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [modalInfo, setModalInfo] = useState({ title: "", description: "" })

  const onPasswordSubmit = async (data: ChangePasswordSchema) => {
    setIsChangingPassword(true)
    try {
      await changePassword(data)

      toast({
        title: t('passwordUpdatedTitle'),
        description: t('passwordUpdatedDescription'),
      })

      setModalInfo({
        title: t('successTitle'),
        description: t('passwordUpdatedDescription')
      })
      setModalOpen(true)
      resetPasswordForm()
    } catch (error: any) {
      toast({
        title: t('passwordErrorTitle'),
        description: error.message || t('passwordErrorDescription'),
        variant: "destructive",
      })

      setModalInfo({
        title: t('errorTitle'),
        description: error.message || t('passwordErrorDescription')
      })
      setModalOpen(true)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      // Establecer cookie con configuración más robusta
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''
        }`;

      // También establecer en localStorage como respaldo
      localStorage.setItem('preferred-locale', newLocale);

      // Navegar a la nueva ruta con el locale
      router.push(pathname, { locale: newLocale });
    });
  };

  return (
    <DashboardShell>
      <DashboardHeader heading={t('header')} text={t('headerDescription')} />

      <div className="grid gap-4 md:gap-8">
        <Tabs defaultValue={tab} onValueChange={setTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="account">{t('accountTab')}</TabsTrigger>
            <TabsTrigger value="preferences">{t('preferencesTab')}</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('changePasswordTitle')}</CardTitle>
                <CardDescription>{t('changePasswordDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contrasenaActual">{t('currentPasswordLabel')}</Label>
                    <Input
                      id="contrasenaActual"
                      type="password"
                      {...registerPassword("contrasenaActual")}
                      placeholder={t('passwordPlaceholder')}
                    />
                    {passwordErrors.contrasenaActual && (
                      <p className="text-sm text-red-500">{passwordErrors.contrasenaActual.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="nuevaContrasena">{t('newPasswordLabel')}</Label>
                    <Input
                      id="nuevaContrasena"
                      type="password"
                      {...registerPassword("nuevaContrasena")}
                      placeholder={t('passwordPlaceholder')}
                    />
                    {passwordErrors.nuevaContrasena && (
                      <p className="text-sm text-red-500">{passwordErrors.nuevaContrasena.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmarContrasena">{t('confirmPasswordLabel')}</Label>
                    <Input
                      id="confirmarContrasena"
                      type="password"
                      {...registerPassword("confirmarContrasena")}
                      placeholder={t('passwordPlaceholder')}
                    />
                    {passwordErrors.confirmarContrasena && (
                      <p className="text-sm text-red-500">{passwordErrors.confirmarContrasena.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isChangingPassword}>
                    {isChangingPassword ? t('changingPasswordButton') : t('changePasswordButton')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('generalPreferencesTitle')}</CardTitle>
                <CardDescription>{t('generalPreferencesDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid gap-2">
                    <label htmlFor="language">{t('languageLabel')}</label>
                    <select
                      id="language"
                      name="language"
                      value={locale}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      disabled={isPending}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="es">{t('spanishOption')}</option>
                      <option value="en">{t('englishOption')}</option>
                      <option value="po">{t('portugueseOption')}</option>
                      <option value="de">{t('germanOption')}</option>
                      <option value="fr">{t('frenchOption')}</option>
                    </select>
                    {isPending && (
                      <p className="text-sm text-muted-foreground">
                        {t('changingLanguage', { default: 'Cambiando idioma...' })}
                      </p>
                    )}
                  </div>
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
