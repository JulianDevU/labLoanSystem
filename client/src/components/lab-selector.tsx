import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { getLaboratories } from "../services/laboratoryService"
import { BeakerIcon, CodeIcon, NetworkIcon } from "lucide-react"
import { useTranslations } from "next-intl"

function getIcon(nombre: string) {
  if (nombre.toLowerCase().includes("fisica")) return <BeakerIcon className="mr-2 h-4 w-4" />
  if (nombre.toLowerCase().includes("telecomunicaciones")) return <NetworkIcon className="mr-2 h-4 w-4" />
  if (nombre.toLowerCase().includes("software")) return <CodeIcon className="mr-2 h-4 w-4" />
  return null
}

interface Lab {
  _id: string
  nombre: string
  descripcion: string
  slug: string
}

interface LabSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function LabSelector({ value, onValueChange }: LabSelectorProps) {
  const [labs, setLabs] = useState<Lab[]>([])
  const t = useTranslations("LabSelector")

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const result = await getLaboratories()
        setLabs(result.data)
      } catch (error) {
        console.error(t("errorLoading"), error)
      }
    }

    fetchLabs()
  }, [t])

  useEffect(() => {
    if (labs.length > 0 && !value) {
      onValueChange(labs[0].slug)
    }
  }, [labs, value, onValueChange])

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder={t("placeholder")} />
      </SelectTrigger>
      <SelectContent>
        {labs.map((lab) => (
          <SelectItem key={lab._id} value={lab.slug}>
            <div className="flex items-center">
              {getIcon(lab.nombre)}
              {lab.nombre}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
