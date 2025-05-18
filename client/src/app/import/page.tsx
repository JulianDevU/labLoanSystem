"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { DashboardHeader } from "@/src/components/dashboard-header"
import { DashboardShell } from "@/src/components/dashboard-shell"
import { FileUpload } from "@/src/components/file-upload"
import { LabSelector } from "@/src/components/lab-selector"
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/src/hooks/use-toast"

export default function ImportPage() {
  const { toast } = useToast()
  const [selectedLab, setSelectedLab] = useState("physics")
  const [importStatus, setImportStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [importDetails, setImportDetails] = useState<{
    fileName: string
    rowCount?: number
    errorMessage?: string
  } | null>(null)

  const handleFileUpload = (file: File, type: "inventory" | "users") => {
    setImportStatus("processing")
    setImportDetails({ fileName: file.name })

    // Simulate file processing
    setTimeout(() => {
      if (Math.random() > 0.2) {
        setImportStatus("success")
        setImportDetails({
          fileName: file.name,
          rowCount: Math.floor(Math.random() * 100) + 10,
        })
        toast({
          title: "Importación exitosa",
          description: `Datos importados correctamente desde ${file.name}`,
        })
      } else {
        setImportStatus("error")
        setImportDetails({
          fileName: file.name,
          errorMessage: "Formato de archivo o estructura de datos inválida",
        })
        toast({
          title: "Error en la importación",
          description: "Hubo un error al procesar tu archivo",
          variant: "destructive",
        })
      }
    }, 2000)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Importar datos" text="Importa equipos o usuarios desde archivos Excel.">
        <LabSelector value={selectedLab} onValueChange={setSelectedLab} />
      </DashboardHeader>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Importar inventario</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Importar datos de inventario</CardTitle>
              <CardDescription>
                Sube un archivo Excel (.xlsx) con los datos de inventario para el laboratorio de {selectedLab}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10">
                <FileUpload
                  accept=".xlsx,.xls"
                  onUpload={(file) => handleFileUpload(file, "inventory")}
                  buttonText="Seleccionar archivo Excel"
                  description="El archivo debe tener columnas para Nombre, Descripción, Categoría, Cantidad, etc."
                  isProcessing={importStatus === "processing"}
                />
              </div>

              {importStatus === "success" && (
                <Alert
                  variant="default"
                  className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle>Importación exitosa</AlertTitle>
                  <AlertDescription>
                    Se importaron correctamente {importDetails?.rowCount} equipos desde {importDetails?.fileName}.
                  </AlertDescription>
                </Alert>
              )}

              {importStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error en la importación</AlertTitle>
                  <AlertDescription>
                    {importDetails?.errorMessage} en el archivo {importDetails?.fileName}.
                  </AlertDescription>
                </Alert>
              )}

              <div className="rounded-md bg-muted p-4">
                <h3 className="mb-2 font-medium">Formato esperado</h3>
                <p className="text-sm text-muted-foreground">Tu archivo Excel debe tener las siguientes columnas:</p>
                <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                  <li>Nombre (obligatorio)</li>
                  <li>Descripción</li>
                  <li>Categoría (obligatorio)</li>
                  <li>Número de serie</li>
                  <li>Cantidad (obligatorio, numérico)</li>
                  <li>Ubicación</li>
                  <li>Notas</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => {
                  // Lógica para descargar plantilla
                  toast({
                    title: "Plantilla descargada",
                    description: "La plantilla de inventario ha sido descargada",
                  })
                }}
              >
                Descargar plantilla
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
