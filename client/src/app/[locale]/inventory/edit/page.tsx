"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { LabSelector } from "@/src/components/lab-selector"
import { useToast } from "@/src/hooks/use-toast"
import { getEquipmentById, updateEquipment } from "@/src/services/equipmentService"
import { getLaboratories } from "@/src/services/laboratoryService"
import { ModalBase } from "@/src/components/modal"
import { useTranslations } from "next-intl"

const formSchema = z.object({
  lab: z.string(),
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  category: z.string().min(1, "La categoría es obligatoria"),
  quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1"),
  location: z.string().optional(),
  notes: z.string().optional(),
})


type FormValues = z.infer<typeof formSchema>

interface Lab {
  _id: string
  nombre: string
  descripcion: string
  slug: string
}


export default function EditInventoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const t = useTranslations("EditInventory")
  const [labs, setLabs] = useState<Lab[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalInfo, setModalInfo] = useState({ title: "", description: "" })

  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [pendingData, setPendingData] = useState<FormValues | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lab: "",
      name: "",
      description: "",
      serialNumber: "",
      category: "",
      quantity: 1,
      location: "",
      notes: "",
    },
  })

  const equipmentId = searchParams.get("id")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [labsResult, equipmentResult] = await Promise.all([
          getLaboratories(),
          equipmentId ? getEquipmentById(equipmentId) : Promise.reject("No se proporcionó ID de equipo"),
        ])

        setLabs(labsResult.data)

        const equipment = equipmentResult

        form.reset({
          lab: equipment.laboratorio_id.slug,
          name: equipment.nombre,
          description: equipment.descripcion || "",
          serialNumber: equipment.numero_serie || "",
          category: equipment.categoria,
          quantity: equipment.cantidad_total,
          location: equipment.ubicacion || "",
          notes: equipment.nota_adicional || "",
        })
      } catch (error) {
        console.error("Error cargando datos:", error)
        toast({
          title: t("errorTitle"),
          description: t("errorLoadData"),
        })
        router.push("/inventory")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [equipmentId, form, router, toast])

  const handleConfirmSubmit = (data: FormValues) => {
    setPendingData(data)
    setConfirmationOpen(true)
  }

  const confirmAndSubmit = () => {
    if (pendingData) {
      onSubmit(pendingData)
      setPendingData(null)
      setConfirmationOpen(false)
    }
  }

  const onSubmit = async (data: FormValues) => {
    if (!equipmentId) {
      toast({
        title: t("errorTitle"),
        description: t("errorNoId"),
      })
      return
    }

    setIsSubmitting(true)
    const selectedLab = labs.find((lab) => lab.slug === data.lab)

    if (!selectedLab) {
      toast({
        title: t("errorTitle"),
        description: t("errorInvalidLab"),
      })
      setIsSubmitting(false)
      return
    }

    try {
      const payload = {
        nombre: data.name,
        descripcion: data.description,
        categoria: data.category,
        cantidad_total: data.quantity,
        numero_serie: data.serialNumber,
        cantidad_disponible: data.quantity,
        ubicacion: data.location,
        nota_adicional: data.notes,
        laboratorio_id: selectedLab._id,
      }

      console.log("Datos a enviar:", payload)

      await updateEquipment(equipmentId, payload)

      setModalInfo({
        title: t("successTitle"),
        description: t("successDescription"),
      })

      setModalOpen(true)

      setTimeout(() => {
        router.push("/inventory")
      }, 2500)
    } catch (error) {
      toast({
        title: t("errorTitle"),
        description: (error as Error).message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <p>{t("loading")}</p>
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={t("header")}
        text={t("headerDescription")}
      >
        <LabSelector
          value={form.watch("lab")}
          onValueChange={(value) => {
            form.setValue("lab", value)
          }}
        />
      </DashboardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleConfirmSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("infoCardTitle")}</CardTitle>
              <CardDescription>{t("infoCardDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("nameLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("namePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("categoryLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("categoryPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("descriptionLabel")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("descriptionPlaceholder")}
                        className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("serialNumberLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("serialNumberPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("quantityLabel")}</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("locationLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("locationPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("notesLabel")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("notesPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="button" variant="outline" className="mr-2" onClick={() => router.back()}>
                {t("cancelButton")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("updatingButton") : t("updateButton")}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {/* Modal de éxito */}
      <ModalBase
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={modalInfo.title}
        description={modalInfo.description}
      />
      <ModalBase
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        title={t("confirmLabChangeTitle")}
        description={t("confirmLabChangeDescription", { lab: labs.find(l => l.slug === pendingData?.lab)?.nombre || "" })}
      >
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setConfirmationOpen(false)}>
            {t("cancelButton")}
          </Button>
          <Button onClick={confirmAndSubmit}>
            {t("confirmButton")}
          </Button>
        </div>
      </ModalBase>
    </DashboardShell>
  )
}
