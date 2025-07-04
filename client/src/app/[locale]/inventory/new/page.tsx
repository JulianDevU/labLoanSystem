"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTranslations } from "next-intl"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { LabSelector } from "@/src/components/lab-selector"
import { useToast } from "@/src/hooks/use-toast"
import { registerEquipment } from "@/src/services/equipmentService"
import { getLaboratories } from "@/src/services/laboratoryService"
import { ModalBase } from "@/src/components/modal"

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

export default function NewInventoryItemPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedLab, setSelectedLab] = useState("fisica")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const t = useTranslations("NewInventory")
  const l = useTranslations("Laboratory")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lab: selectedLab,
      name: "",
      description: "",
      serialNumber: "",
      category: "",
      quantity: 1,
      location: "",
      notes: "",
    },
  })

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
  }, [])

  const [modalOpen, setModalOpen] = useState(false)
  const [modalInfo, setModalInfo] = useState({
    title: "",
    description: ""
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    const selectedLab = labs.find((lab) => lab.slug === data.lab)

    if (!selectedLab) {
      toast({
        title: t("errorTitle", { default: "Error" }),
        description: t("errorInvalidLab", { default: "Laboratorio seleccionado no válido" }),
      })
      setIsSubmitting(false)
      return
    }

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

    try {
      await registerEquipment(payload)

      setModalInfo({
        title: t("successTitle", { default: "Equipo agregado exitosamente" }),
        description: t("successDescription", { default: "El nuevo equipo ha sido registrado en el inventario." }),
      })
      setModalOpen(true)

      setTimeout(() => {
        router.push("/inventory")
      }, 2500)

    } catch (error: any) {
      setModalInfo({
        title: t("errorTitle", { default: "Error" }),
        description: error.message || t("errorAdd", { default: "No se pudo agregar el equipo." }),
      })
      setModalOpen(true)

    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={t("pageTitle", { default: "Agregar nuevo equipo" })} text={t("pageDescription", { default: "Agrega un nuevo equipo al inventario del laboratorio seleccionado." })}>
        <LabSelector
          value={selectedLab}
          onValueChange={(value) => {
            setSelectedLab(value)
            form.setValue("lab", value)
          }}
        />
      </DashboardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
            <CardTitle>{t("infoCardTitle", { default: "Información del equipo" })}</CardTitle>
            <CardDescription>{t("infoCardDescription", { default: "Introduce los detalles del nuevo equipo." })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("nameLabel", { default: "Nombre" })}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("namePlaceholder", { default: "Nombre del equipo" })} {...field} />
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
                      <FormLabel>{t("categoryLabel", { default: "Categoría" })}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("categoryPlaceholder", { default: "Categoría" })} {...field} />
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
                    <FormLabel>{t("descriptionLabel", { default: "Descripción" })}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("descriptionPlaceholder", { default: "Descripción del equipo" })} className="min-h-[100px]" {...field} />
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
                    <FormLabel>{t("serialNumberLabel", { default: "Número de serie" })}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("serialNumberPlaceholder", { default: "Número de serie (si aplica)" })} {...field} />
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
                    <FormLabel>{t("quantityLabel", { default: "Cantidad" })}</FormLabel>
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
                    <FormLabel>{t("locationLabel", { default: "Ubicación de almacenamiento" })}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("locationPlaceholder", { default: "Ubicación de almacenamiento" })} {...field} />
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
                    <FormLabel>{t("notesLabel", { default: "Notas adicionales" })}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("notesPlaceholder", { default: "Notas adicionales" })} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="button" variant="outline" className="mr-2" onClick={() => router.back()}>
                {t("cancelButton", { default: "Cancelar" })}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("addingButton", { default: "Agregando equipo..." }) : t("addButton", { default: "Agregar equipo" })}
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
