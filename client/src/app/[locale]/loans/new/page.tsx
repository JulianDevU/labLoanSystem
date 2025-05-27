"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { LabSelector } from "@/src/components/lab-selector"
import { ImageUpload } from "@/src/components/image-upload"
import { EquipmentSelector } from "@/src/components/equipment-selector"
import { useToast } from "@/src/hooks/use-toast"
import { registerLoan } from "@/src/services/loanService"
import { getLaboratories } from "@/src/services/laboratoryService"
import { ModalBase } from "@/src/components/modal"
import { useTranslations } from "next-intl"

const getMinDateTime = () => {
  const ahora = new Date();
  const fechaMinima = new Date(ahora.getTime() + (5 * 60 * 1000));

  // Formatear para input datetime-local (YYYY-MM-DDTHH:mm)
  const year = fechaMinima.getFullYear();
  const month = String(fechaMinima.getMonth() + 1).padStart(2, '0');
  const day = String(fechaMinima.getDate()).padStart(2, '0');
  const hours = String(fechaMinima.getHours()).padStart(2, '0');
  const minutes = String(fechaMinima.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Schema con traducciones
const createFormSchema = (t: any) => z.object({
  lab: z.string(),
  beneficiaryType: z.enum(["estudiante", "docente"]),
  beneficiaryId: z.string().min(1, t('validation.idRequired')),
  beneficiaryName: z.string().min(1, t('validation.nameRequired')),
  beneficiaryEmail: z.string().email(t('validation.invalidEmail')),
  equipment: z.array(z.object({
    id: z.string(),
    name: z.string(),
    quantity: z.number().min(1)
  })).min(1, t('validation.equipmentRequired')),
  description: z.string().optional(),
  returnDate: z.string()
    .min(1, t('validation.returnDateRequired'))
    .refine((date) => {
      const selectedDate = new Date(date);
      const now = new Date();
      const minDate = new Date(now.getTime() + (5 * 60 * 1000));
      return selectedDate >= minDate;
    }, {
      message: t('validation.returnDateMinimum')
    }),
  photo: z
    .instanceof(File, { message: t('validation.photoRequired') })
    .refine((file) => file && file.size > 0, { message: t('validation.photoRequired') }),
});

interface Lab {
  _id: string
  nombre: string
  descripcion: string
  slug: string
}

export default function NewLoanPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedLab, setSelectedLab] = useState("fisica")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const t = useTranslations("NewLoan")
  const l = useTranslations("Laboratory")

  // Estado para fecha mínima
  const [minDateTime, setMinDateTime] = useState("")

  // Crear el schema con traducciones
  const formSchema = createFormSchema(t)
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lab: selectedLab,
      beneficiaryType: "estudiante",
      beneficiaryId: "",
      beneficiaryName: "",
      beneficiaryEmail: "",
      equipment: [],
      description: "",
      returnDate: "",
      photo: undefined as unknown as File,
    },
  });

  const [labs, setLabs] = useState<Lab[]>([])

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const result = await getLaboratories()
        setLabs(result.data)
      } catch (error) {
        console.error("Error cargando laboratorios", error)
      }
    }

    fetchLabs()

    // Establecer fecha mínima al cargar
    setMinDateTime(getMinDateTime())

    // Actualizar fecha mínima cada minuto
    const interval = setInterval(() => {
      setMinDateTime(getMinDateTime())
    }, 60000) // 1 minuto

    return () => clearInterval(interval)
  }, [])

  // Función para enviar email de notificación
  const sendLoanNotification = async (loanData: any, selectedLab: Lab) => {
    try {
      // Enviar la fecha de préstamo y devolución en formato ISO, pero explícitamente en la zona horaria de Colombia
      // Esto ayuda a que el backend siempre reciba la hora local correcta
      const nowColombia = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }))
      const returnColombia = new Date(new Date(loanData.fecha_devolucion).toLocaleString('en-US', { timeZone: 'America/Bogota' }))
      const emailData = {
        beneficiaryName: loanData.nombre_beneficiado,
        beneficiaryEmail: loanData.correo_beneficiado,
        laboratoryName: selectedLab.nombre,
        equipmentList: loanData.equipos.map((eq: any) => ({
          name: form.getValues('equipment').find(item => item.id === eq.equipo_id)?.name || t('equipmentNotFound'),
          quantity: eq.cantidad
        })),
        loanDate: nowColombia.toISOString(),
        returnDate: returnColombia.toISOString(),
      }

      const response = await fetch('/api/mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || t('emailError'))
      }

      return true
    } catch (error) {
      console.error('Error enviando notificación por email:', error)
      toast({
        title: t('warningTitle'),
        description: t('emailWarningDescription'),
        variant: "default",
      })
      return false
    }
  }

  const [modalOpen, setModalOpen] = useState(false)
  const [modalInfo, setModalInfo] = useState({
    title: "",
    description: ""
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    const selectedLabData = labs.find((lab) => lab.slug === data.lab)

    // Protección extra: asegurar que equipment es un array
    if (!Array.isArray(data.equipment)) {
      toast({
        title: t('selectionErrorTitle'),
        description: t('selectionErrorDescription'),
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Log para depuración
    console.log("[DEBUG] Valor de data.equipment al enviar:", data.equipment)

    if (data.equipment.length === 0) {
      toast({
        title: t('equipmentSelectionTitle'),
        description: t('equipmentSelectionDescription'),
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (!selectedLabData) {
      toast({
        title: t('errorTitle'),
        description: t('invalidLabError'),
      })
      setIsSubmitting(false)
      return
    }

    try {
      const equipos = data.equipment.map(item => ({
        equipo_id: item.id,
        cantidad: item.quantity
      }))

      const loanData = {
        tipo_beneficiado: data.beneficiaryType,
        numero_identificacion: data.beneficiaryId,
        nombre_beneficiado: data.beneficiaryName,
        correo_beneficiado: data.beneficiaryEmail,
        equipos: equipos,
        fecha_devolucion: new Date(data.returnDate).toISOString(),
        evidencia_foto: data.photo as File,
        laboratorio_id: selectedLabData._id,
        descripcion: data.description,
      };

      console.log("Enviando datos del préstamo:", {
        ...loanData,
        fecha_original: data.returnDate,
        fecha_iso: loanData.fecha_devolucion
      })

      // Registrar el préstamo
      await registerLoan(loanData)

      // Enviar notificación por email
      await sendLoanNotification(loanData, selectedLabData)

      setModalInfo({
        title: t('successTitle'),
        description: t('successDescription', { count: equipos.length }),
      })
      setModalOpen(true)

      setTimeout(() => {
        router.push("/loans")
      }, 2500)

    } catch (error: any) {
      console.error("Error al crear préstamo:", error)

      setModalInfo({
        title: t('errorTitle'),
        description: error.message || t('genericError'),
      })
      setModalOpen(true)

    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={t('header')}
        text={t('headerDescription')}
      >
        <LabSelector
          value={selectedLab}
          onValueChange={(value) => {
            setSelectedLab(value)
            form.setValue("lab", value)
            form.setValue("equipment", [])
          }}
        />
      </DashboardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-16 lg:pb-0">
          <Card className="max-h-[calc(100vh-180px)] overflow-y-auto">
            <CardHeader>
              <CardTitle>{t('beneficiaryInfoTitle')}</CardTitle>
              <CardDescription>{t('beneficiaryInfoDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="beneficiaryType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>{t('beneficiaryTypeLabel')}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="estudiante" />
                          </FormControl>
                          <FormLabel className="font-normal">{t('studentOption')}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="docente" />
                          </FormControl>
                          <FormLabel className="font-normal">{t('teacherOption')}</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="beneficiaryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('idLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('idPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="beneficiaryName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('nameLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('namePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="beneficiaryEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('emailLabel')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('emailPlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('emailDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="max-h-[calc(100vh-180px)] overflow-y-auto"> {/* Ajusta max-h y overflow-y-auto aquí también */}
            <CardHeader>
              <CardTitle>{t('loanDetailsTitle')}</CardTitle>
              <CardDescription>{t('loanDetailsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="equipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('equipmentLabel')}</FormLabel>
                    <FormControl>
                      <EquipmentSelector
                        lab={selectedLab}
                        value={field.value}
                        onChange={field.onChange}
                        single={false}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('equipmentDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('descriptionLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('descriptionPlaceholder')}
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="returnDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('returnDateLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        min={minDateTime}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('returnDateDescription')}
                      <br />
                      <small className="text-yellow-600">
                        ⚠️ {t('returnDateWarning')}
                      </small>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('photoLabel')}</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormDescription>{t('photoDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end sticky bottom-0 bg-background p-4 border-t"> {/* CardFooter sticky */}
              <Button type="button" variant="outline" className="mr-2" onClick={() => router.back()}>
                {t('cancelButton')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('creatingButton') : t('createButton')}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      <ModalBase
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={modalInfo.title}
        description={modalInfo.description}
      />
    </DashboardShell>
  )
}