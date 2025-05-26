"use client"
//prueba
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

const formSchema = z.object({
  lab: z.string(),
  beneficiaryType: z.enum(["estudiante", "docente"]),
  beneficiaryId: z.string().min(1, "ID es requerido"),
  beneficiaryName: z.string().min(1, "Nombre es requerido"),
  beneficiaryEmail: z.string().email("Correo electrónico inválido"),
  equipment: z.array(z.object({
    id: z.string(),
    name: z.string(),
    quantity: z.number().min(1)
  })).min(1, "Debes seleccionar al menos un equipo"),
  description: z.string().optional(),
  returnDate: z.string()
    .min(1, "Fecha de devolución es requerida")
    .refine((date) => {
      const selectedDate = new Date(date);
      const now = new Date();
      const minDate = new Date(now.getTime() + (5 * 60 * 1000));
      return selectedDate >= minDate;
    }, {
      message: "La fecha de devolución debe ser al menos 5 minutos posterior a la hora actual"
    }),
  photo: z
    .instanceof(File, { message: "La imagen es requerida" })
    .refine((file) => file && file.size > 0, { message: "La imagen es requerida" }),
});

type FormValues = z.infer<typeof formSchema>;
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
  // CAMBIO 3: Estado para fecha mínima
  const [minDateTime, setMinDateTime] = useState("")

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
      photo: undefined as unknown as File, // Forzar tipo File, pero sin valor inicial
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
    
    // CAMBIO 4: Establecer fecha mínima al cargar
    setMinDateTime(getMinDateTime())
    
    // CAMBIO 5: Actualizar fecha mínima cada minuto
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
          name: form.getValues('equipment').find(item => item.id === eq.equipo_id)?.name || 'Equipo no encontrado',
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
        throw new Error(errorData.message || 'Error enviando notificación')
      }

      return true
    } catch (error) {
      console.error('Error enviando notificación por email:', error)
      toast({
        title: "Advertencia",
        description: "El préstamo se creó correctamente, pero no se pudo enviar la notificación por email.",
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
    const selectedLab = labs.find((lab) => lab.slug === data.lab)

    if (!selectedLab) {
      toast({
        title: "Error",
        description: "Laboratorio seleccionado no válido",
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
        laboratorio_id: selectedLab._id,
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
      await sendLoanNotification(loanData, selectedLab)

      setModalInfo({
        title: "Préstamo creado exitosamente",
        description: `El préstamo con ${equipos.length} equipo(s) ha sido registrado correctamente y se ha enviado una notificación por email.`,
      })
      setModalOpen(true)

      setTimeout(() => {
        router.push("/loans")
      }, 2500)
      
    } catch (error: any) {
      console.error("Error al crear préstamo:", error)

      setModalInfo({
        title: "Error",
        description: error.message || "Hubo un error al crear el préstamo",
      })
      setModalOpen(true)

    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Nuevo Préstamo"
        text="Registra un nuevo préstamo de equipos para un estudiante o profesor."
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Información del Beneficiario</CardTitle>
              <CardDescription>Ingresa los datos del estudiante o profesor que recibirá los equipos.</CardDescription>
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
                            <RadioGroupItem value="estudiante" />
                          </FormControl>
                          <FormLabel className="font-normal">Estudiante</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="docente" />
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
                      <EquipmentSelector
                        lab={selectedLab}
                        value={field.value}
                        onChange={field.onChange}
                        single={false}
                      />
                    </FormControl>
                    <FormDescription>
                      Selecciona uno o más equipos para este préstamo. Puedes ajustar las cantidades según sea necesario.
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
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ingresa detalles adicionales sobre este préstamo (opcional)"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CAMBIO 7: Campo de fecha con fecha mínima y descripción actualizada */}
              <FormField
                control={form.control}
                name="returnDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Devolución Esperada</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        min={minDateTime}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Especifica cuándo se espera que se devuelvan todos los equipos.
                      <br />
                      <small className="text-yellow-600">
                        ⚠️ La fecha debe ser al menos 5 minutos posterior a la hora actual.
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
                    <FormLabel>Evidencia Fotográfica</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormDescription>Toma una foto de los equipos entregados como evidencia.</FormDescription>
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
      <ModalBase
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={modalInfo.title}
        description={modalInfo.description}
      />
    </DashboardShell>
  )
}