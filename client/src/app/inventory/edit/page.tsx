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

export default function EditInventoryItemPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const [labs, setLabs] = useState<Lab[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

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
                    title: "Error",
                    description: "No se pudieron cargar los datos del equipo.",
                })
                router.push("/inventory")
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [equipmentId, form, router, toast])

    const onSubmit = async (data: FormValues) => {
        if (!equipmentId) {
            toast({
                title: "Error",
                description: "ID del equipo no encontrado.",
            });
            return;
        }

        setIsSubmitting(true);
        const selectedLab = labs.find((lab) => lab.slug === data.lab);

        if (!selectedLab) {
            toast({
                title: "Error",
                description: "Laboratorio inválido.",
            });
            setIsSubmitting(false);
            return;
        }

        try {
            // Obtener equipo actual para verificar cantidad_disponible
            const currentEquipment = await getEquipmentById(equipmentId);
            const currentDisponible = currentEquipment.cantidad_disponible ?? currentEquipment.cantidad_total;

            // Ajustar cantidad_disponible para que no sea mayor que la cantidad_total actualizada
            const adjustedDisponible = Math.min(currentDisponible, data.quantity);

            const payload = {
                nombre: data.name,
                descripcion: data.description,
                categoria: data.category,
                cantidad_total: data.quantity,
                numero_serie: data.serialNumber,
                cantidad_disponible: adjustedDisponible,
                ubicacion: data.location,
                nota_adicional: data.notes,
                laboratorio_id: selectedLab._id,
            };

            console.log("Datos a enviar:", payload);

            await updateEquipment(equipmentId, payload);

            toast({
                title: "Equipo actualizado exitosamente",
                description: "Los datos del equipo han sido actualizados.",
            });
            router.push("/inventory");
        } catch (error) {
            toast({
                title: "Error",
                description: (error as Error).message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    if (isLoading) {
        return <p>Cargando...</p>
    }

    return (
        <DashboardShell>
            <DashboardHeader heading="Editar equipo del inventario" text="Modifica los detalles del equipo seleccionado.">
                <LabSelector
                    value={form.watch("lab")}
                    onValueChange={(value) => {
                        form.setValue("lab", value)
                    }}
                />
            </DashboardHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del equipo</CardTitle>
                            <CardDescription>Modifica los detalles del equipo.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nombre del equipo" {...field} />
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
                                            <FormLabel>Categoría</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Categoría" {...field} />
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
                                        <FormLabel>Descripción</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Descripción del equipo" className="min-h-[100px]" {...field} />
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
                                            <FormLabel>Número de serie</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Número de serie (si aplica)" {...field} />
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
                                            <FormLabel>Cantidad</FormLabel>
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
                                        <FormLabel>Ubicación de almacenamiento</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ubicación de almacenamiento" {...field} />
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
                                        <FormLabel>Notas adicionales</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Notas adicionales" {...field} />
                                        </FormControl>
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
                                {isSubmitting ? "Actualizando equipo..." : "Actualizar equipo"}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </DashboardShell>
    )
}
