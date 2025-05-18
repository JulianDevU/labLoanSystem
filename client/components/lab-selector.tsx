"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BeakerIcon, NetworkIcon, CodeIcon } from "@/components/icons"

interface LabSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function LabSelector({ value, onValueChange }: LabSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Selecciona laboratorio" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="physics" className="flex items-center">
          <div className="flex items-center">
            <BeakerIcon className="mr-2 h-4 w-4" />
            Laboratorio de Física
          </div>
        </SelectItem>
        <SelectItem value="telecommunications">
          <div className="flex items-center">
            <NetworkIcon className="mr-2 h-4 w-4" />
            Laboratorio de Telecomunicaciones
          </div>
        </SelectItem>
        <SelectItem value="software">
          <div className="flex items-center">
            <CodeIcon className="mr-2 h-4 w-4" />
            Laboratorio de Software
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
