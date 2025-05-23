"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Checkbox } from "@/src/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/src/hooks/use-toast"
import { deleteEquipment, getEquipment } from "../services/equipmentService"

interface InventoryItem {
  id: string
  nombre: string
  categoria: string
  cantidad_total: number
  ubicacion?: string
  laboratorio_id: {
    _id: string
    nombre: string
    slug: string
    descripcion?: string
  }
}


interface InventoryTableProps {
  lab: string
  searchQuery: string
}

export function InventoryTable({ lab, searchQuery }: InventoryTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!lab) return
    setLoading(true)

    getEquipment()
      .then((data) => {
        console.log("equipos recibidos:", data)
        console.log("lab actual:", lab)

        const mappedItems: InventoryItem[] = data.map((item) => ({
          id: item._id,
          nombre: item.nombre,
          categoria: item.categoria,
          cantidad_total: item.cantidad_total,
          ubicacion: item.ubicacion,
          laboratorio_id: item.laboratorio_id
        }))

        // Debugging: mostrar todos los laboratorios disponibles
        console.log("Laboratorios disponibles:", mappedItems.map(item => ({
          id: item.laboratorio_id._id,
          nombre: item.laboratorio_id.nombre
        })))

        // Filtrar por ID, slug o nombre de laboratorio
        const filteredByLab = mappedItems.filter((item) => {
          const matchById = item.laboratorio_id?._id === lab
          const matchBySlug = item.laboratorio_id?.slug === lab
          const matchByName = item.laboratorio_id?.nombre?.toLowerCase().includes(lab.toLowerCase())
          return matchById || matchBySlug || matchByName
        })

        console.log("Equipos filtrados:", filteredByLab)
        setItems(filteredByLab)
      })
      .catch((error) => {
        console.error("Error al obtener equipos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los equipos",
          variant: "destructive"
        })
      })
      .finally(() => setLoading(false))
  }, [lab, toast])

  const filteredItems = items.filter(
    (item) =>
      item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map((item) => item.id))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteEquipment(id)

      toast({
        title: "Equipo eliminado",
        description: `El equipo con ID ${id} fue eliminado correctamente.`,
      })

      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (error: any) {
      toast({
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar el equipo.",
        variant: "destructive",
      })
    }
  }


  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium">
                <Checkbox
                  checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Seleccionar todo"
                />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">ID</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Nombre</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Categoría</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Cantidad</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Ubicación</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Laboratorio</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  Cargando...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="h-24 text-center">
                  No se encontraron equipos para este laboratorio.
                  <br />
                  <small className="text-muted-foreground">
                    Laboratorio seleccionado: {lab}
                  </small>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleSelectItem(item.id)}
                      aria-label={`Seleccionar ${item.nombre}`}
                    />
                  </td>
                  <td className="p-4 align-middle font-medium">{item.id}</td>
                  <td className="p-4 align-middle">{item.nombre}</td>
                  <td className="p-4 align-middle">{item.categoria}</td>
                  <td className="p-4 align-middle">{item.cantidad_total}</td>
                  <td className="p-4 align-middle">{item.ubicacion}</td>
                  <td className="p-4 align-middle">{item.laboratorio_id.nombre}</td>
                  <td className="p-4 align-middle">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/inventory/edit?id=${item.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}