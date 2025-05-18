"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { LabSelector } from "@/src/components/lab-selector"
import { ImageUpload } from "@/src/components/image-upload"
import { EquipmentSelector } from "@/src/components/equipment-selector"
import { useToast } from "@/src/hooks/use-toast"

const formSchema = z.object({
  lab: z.string(),
  beneficiaryType: z.enum(["student", "teacher"]),
  beneficiaryId: z.string().min(1, "ID is required"),
  beneficiaryName: z.string().min(1, "Name is required"),
  beneficiaryEmail: z.string().email("Invalid email address"),
  equipment: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        quantity: z.number().min(1),
      }),
    )
    .min(1, "At least one equipment item is required"),
  description: z.string().optional(),
  returnDate: z.string().min(1, "Return date is required"),
  photo: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function NewLoanPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedLab, setSelectedLab] = useState("physics")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lab: selectedLab,
      beneficiaryType: "student",
      beneficiaryId: "",
      beneficiaryName: "",
      beneficiaryEmail: "",
      equipment: [],
      description: "",
      returnDate: "",
      photo: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Form data:", data)
      setIsSubmitting(false)
      toast({
        title: "Loan created successfully",
        description: "The loan has been registered and emails have been sent.",
      })
      router.push("/dashboard")
    }, 2000)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Nuevo Préstamo" text="Registra un nuevo préstamo de equipo para un estudiante o profesor.">
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
              <CardTitle>Información del Beneficiario</CardTitle>
              <CardDescription>
                Ingresa los datos del estudiante o profesor que recibirá el equipo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="beneficiaryType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo de Beneficiario</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="student" />
                          </FormControl>
                          <FormLabel className="font-normal">Estudiante</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="teacher" />
                          </FormControl>
                          <FormLabel className="font-normal">Profesor</FormLabel>
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
                      <FormLabel>Número de Identificación</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa el número de identificación" {...field} />
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
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa el nombre completo" {...field} />
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
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Ingresa el correo electrónico" {...field} />
                    </FormControl>
                    <FormDescription>
                      Se enviará una notificación a este correo cuando el préstamo sea completado.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles del Préstamo</CardTitle>
              <CardDescription>Selecciona los equipos y especifica los detalles del préstamo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="equipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipos</FormLabel>
                    <FormControl>
                      <EquipmentSelector lab={selectedLab} value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ingresa detalles adicionales sobre este préstamo"
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
                    <FormLabel>Fecha de Devolución Esperada</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evidencia Fotográfica</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormDescription>Toma una foto del equipo entregado como evidencia.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="button" variant="outline" className="mr-2" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando Préstamo..." : "Crear Préstamo"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </DashboardShell>
  )
}
