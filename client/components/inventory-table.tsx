"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface InventoryTableProps {
  lab: string
  searchQuery: string
}

export function InventoryTable({ lab, searchQuery }: InventoryTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // This would normally fetch data from an API
  const inventoryItems = {
    physics: [
      { id: "PH001", name: "Digital Oscilloscope", category: "Measurement Tools", quantity: 5, location: "Cabinet A" },
      { id: "PH002", name: "Function Generator", category: "Measurement Tools", quantity: 3, location: "Cabinet A" },
      { id: "PH003", name: "Digital Multimeter", category: "Measurement Tools", quantity: 10, location: "Cabinet B" },
      { id: "PH004", name: "Laser Kit", category: "Optical Equipment", quantity: 2, location: "Cabinet C" },
      { id: "PH005", name: "Optical Bench", category: "Optical Equipment", quantity: 3, location: "Cabinet C" },
      {
        id: "PH006",
        name: "Circuit Components Kit",
        category: "Electrical Components",
        quantity: 15,
        location: "Drawer 1",
      },
      { id: "PH007", name: "Force Sensor", category: "Mechanics Equipment", quantity: 5, location: "Cabinet D" },
    ],
    telecommunications: [
      { id: "TC001", name: "Spectrum Analyzer", category: "Signal Analyzers", quantity: 2, location: "Room 101" },
      { id: "TC002", name: "Network Analyzer", category: "Signal Analyzers", quantity: 2, location: "Room 101" },
      { id: "TC003", name: "Router", category: "Network Devices", quantity: 5, location: "Cabinet A" },
      { id: "TC004", name: "Switch", category: "Network Devices", quantity: 8, location: "Cabinet A" },
      { id: "TC005", name: "Fiber Optic Kit", category: "Communication Equipment", quantity: 3, location: "Cabinet B" },
      { id: "TC006", name: "Antenna Kit", category: "Communication Equipment", quantity: 4, location: "Cabinet B" },
    ],
    software: [
      { id: "SW001", name: "Raspberry Pi", category: "Development Boards", quantity: 8, location: "Cabinet A" },
      { id: "SW002", name: "Arduino Kit", category: "Development Boards", quantity: 10, location: "Cabinet A" },
      { id: "SW003", name: "Sensor Kit", category: "Sensor Kits", quantity: 5, location: "Cabinet B" },
      { id: "SW004", name: "VR Headset", category: "VR/AR Equipment", quantity: 2, location: "Secure Cabinet" },
      { id: "SW005", name: "Graphics Tablet", category: "Computing Devices", quantity: 4, location: "Cabinet C" },
    ],
  }

  const currentItems = inventoryItems[lab as keyof typeof inventoryItems]

  // Filter items based on search query
  const filteredItems = currentItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const handleDelete = (id: string) => {
    // This would normally call an API to delete the item
    toast({
      title: "Item deleted",
      description: `Item ${id} has been deleted from inventory.`,
    })
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
                  aria-label="Select all"
                />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">ID</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Category</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Quantity</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Location</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td className="p-4 align-middle">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleSelectItem(item.id)}
                    aria-label={`Select ${item.name}`}
                  />
                </td>
                <td className="p-4 align-middle font-medium">{item.id}</td>
                <td className="p-4 align-middle">{item.name}</td>
                <td className="p-4 align-middle">{item.category}</td>
                <td className="p-4 align-middle">{item.quantity}</td>
                <td className="p-4 align-middle">{item.location}</td>
                <td className="p-4 align-middle">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => router.push(`/inventory/edit/${item.id}`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={7} className="h-24 text-center">
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
