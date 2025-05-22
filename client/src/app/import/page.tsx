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
import { Progress } from "@/src/components/ui/progress"
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Info } from "lucide-react"
import { useToast } from "@/src/hooks/use-toast"
import { importEquipmentFromExcel, generateExcelTemplate } from "@/src/services/excelService"

interface ImportResult {
  success: boolean
  importedCount: number
  errors: string[]
  skippedRows: number
}

export default function ImportPage() {
  const { toast } = useToast()
  const [selectedLab, setSelectedLab] = useState("")
  const [importStatus, setImportStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importProgress, setImportProgress] = useState(0)

  const handleFileUpload = async (file: File, type: "inventory" | "users") => {
    if (type !== "inventory") return

    if (!selectedLab) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un laboratorio",
        variant: "destructive",
      })
      return
    }

    setImportStatus("processing")
    setImportProgress(0)
    setImportResult(null)

    // Simular progreso
    const progressInterval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      console.log("Iniciando importación de Excel con laboratorio slug:", selectedLab)

      // Aquí es donde se llama a la función de importación
      const result = await importEquipmentFromExcel(file, selectedLab)

      console.log("Resultado de importación:", result)

      clearInterval(progressInterval)
      setImportProgress(100)
      setImportResult(result)

      if (result.success) {
        setImportStatus("success")
        toast({
          title: "Importación exitosa",
          description: `Se importaron ${result.importedCount} equipos correctamente`,
        })
      } else {
        setImportStatus("error")
        toast({
          title: "Importación con errores",
          description: `Se encontraron ${result.errors.length} errores durante la importación`,
          variant: "destructive",
        })
      }
    } catch (error) {
      clearInterval(progressInterval)
      setImportProgress(0)
      setImportStatus("error")

      console.error("Error en importación:", error)

      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setImportResult({
        success: false,
        importedCount: 0,
        errors: [errorMessage],
        skippedRows: 0,
      })

      toast({
        title: "Error en la importación",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleDownloadTemplate = () => {
    try {
      generateExcelTemplate()
      toast({
        title: "Plantilla descargada",
        description: "La plantilla de inventario ha sido descargada exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error al descargar",
        description: "No se pudo descargar la plantilla",
        variant: "destructive",
      })
    }
  }

  const resetImport = () => {
    setImportStatus("idle")
    setImportResult(null)
    setImportProgress(0)
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
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Importar datos de inventario
              </CardTitle>
              <CardDescription>
                Sube un archivo Excel (.xlsx) con los datos de inventario para el laboratorio seleccionado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10">
                <FileUpload
                  accept=".xlsx,.xls"
                  onUpload={(file) => handleFileUpload(file, "inventory")}
                  buttonText="Seleccionar archivo Excel"
                  description="El archivo debe tener columnas para Nombre, Descripción, Categoría, Cantidad, etc."
                  isProcessing={importStatus === "processing"}
                />
              </div>

              {importStatus === "processing" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">Procesando archivo...</span>
                  </div>
                  <Progress value={importProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground text-center">{importProgress}% completado</p>
                </div>
              )}

              {importStatus === "success" && importResult && (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle>Importación exitosa</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>
                      Se importaron correctamente <strong>{importResult.importedCount}</strong> equipos.
                    </p>
                    {importResult.skippedRows > 0 && (
                      <p className="text-sm">Se omitieron {importResult.skippedRows} filas vacías.</p>
                    )}
                    {importResult.errors.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">
                          Ver {importResult.errors.length} advertencias
                        </summary>
                        <ul className="mt-2 text-xs space-y-1 max-h-32 overflow-y-auto">
                          {importResult.errors.slice(0, 10).map((error, index) => (
                            <li key={index} className="text-orange-600 dark:text-orange-400">
                              • {error}
                            </li>
                          ))}
                          {importResult.errors.length > 10 && (
                            <li className="text-muted-foreground">... y {importResult.errors.length - 10} más</li>
                          )}
                        </ul>
                      </details>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {importStatus === "error" && importResult && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error en la importación</AlertTitle>
                  <AlertDescription className="space-y-2">
                    {importResult.importedCount > 0 ? (
                      <p>
                        Se importaron <strong>{importResult.importedCount}</strong> equipos, pero se encontraron{" "}
                        <strong>{importResult.errors.length}</strong> errores.
                      </p>
                    ) : (
                      <p>No se pudo completar la importación.</p>
                    )}

                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">
                        Ver errores ({importResult.errors.length})
                      </summary>
                      <ul className="mt-2 text-xs space-y-1 max-h-32 overflow-y-auto">
                        {importResult.errors.slice(0, 10).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {importResult.errors.length > 10 && (
                          <li className="text-muted-foreground">... y {importResult.errors.length - 10} más</li>
                        )}
                      </ul>
                    </details>
                  </AlertDescription>
                </Alert>
              )}

              {(importStatus === "success" || importStatus === "error") && (
                <div className="flex justify-center">
                  <Button onClick={resetImport} variant="outline">
                    Importar otro archivo
                  </Button>
                </div>
              )}

              <div className="rounded-md bg-muted p-4">
                <h3 className="mb-2 font-medium">Formato esperado</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Tu archivo Excel debe tener las siguientes columnas:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-red-600">•</span>
                      <span>nombre (obligatorio)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-red-600">•</span>
                      <span>categoria (obligatorio)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-red-600">•</span>
                      <span>cantidad_total (obligatorio, numérico)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-orange-600">•</span>
                      <span>cantidad_disponible (auto si no se especifica)</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-400">•</span>
                      <span>descripcion (opcional)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-400">•</span>
                      <span>numero_serie (opcional)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-400">•</span>
                      <span>ubicacion (opcional)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-400">•</span>
                      <span>nota_adicional (opcional)</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Nota:</strong> Si no especificas "Cantidad Disponible", se usará automáticamente el valor de
                    "Cantidad Total". La cantidad disponible no puede ser mayor que la cantidad total.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleDownloadTemplate} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Descargar plantilla
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
