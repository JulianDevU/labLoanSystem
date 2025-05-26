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
import { importEquipmentFromExcel, generateExcelTemplate } from "@/src/services/importExcelService"
import { useTranslations } from "next-intl"

interface ImportResult {
  success: boolean
  importedCount: number
  errors: string[]
  skippedRows: number
}

export default function ImportPage() {
  const { toast } = useToast()
  const t = useTranslations("Import")
  const [selectedLab, setSelectedLab] = useState("")
  const [importStatus, setImportStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importProgress, setImportProgress] = useState(0)

  const handleFileUpload = async (file: File, type: "inventory" | "users") => {
    if (type !== "inventory") return

    if (!selectedLab) {
      toast({
        title: t("errorTitle"),
        description: t("labRequired"),
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
          title: t("successTitle"),
          description: t("successImported", { count: result.importedCount }),
        })
      } else {
        setImportStatus("error")
        toast({
          title: t("errorTitle"),
          description: t("errorPartial", { count: result.importedCount, errors: result.errors.length }),
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
        title: t("errorTitle"),
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleDownloadTemplate = () => {
    try {
      generateExcelTemplate()
      toast({
        title: t("templateDownloaded"),
        description: t("templateDownloadedDesc"),
      })
    } catch (error) {
      toast({
        title: t("templateDownloadError"),
        description: t("templateDownloadErrorDesc"),
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
      <DashboardHeader heading={t("title")} text={t("subtitle")}>
        <LabSelector value={selectedLab} onValueChange={setSelectedLab} />
      </DashboardHeader>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">{t("tabInventory")}</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                {t("cardTitle")}
              </CardTitle>
              <CardDescription>
                {t("cardDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10">
                <FileUpload
                  accept=".xlsx,.xls"
                  onUpload={(file) => handleFileUpload(file, "inventory")}
                  buttonText={t("fileButton")}
                  description={t("fileDescription")}
                  isProcessing={importStatus === "processing"}
                />
              </div>

              {importStatus === "processing" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">{t("processing")}</span>
                  </div>
                  <Progress value={importProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground text-center">{t("progress", { progress: importProgress })}</p>
                </div>
              )}

              {importStatus === "success" && importResult && (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle>{t("successTitle")}</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p dangerouslySetInnerHTML={{ __html: t("successImported", { count: importResult.importedCount }) }} />
                    {importResult.skippedRows > 0 && (
                      <p className="text-sm">{t("successSkipped", { skipped: importResult.skippedRows })}</p>
                    )}
                    {importResult.errors.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">
                          {t("successWarnings", { count: importResult.errors.length })}
                        </summary>
                        <ul className="mt-2 text-xs space-y-1 max-h-32 overflow-y-auto">
                          {importResult.errors.slice(0, 10).map((error, index) => (
                            <li key={index} className="text-orange-600 dark:text-orange-400">
                              • {error}
                            </li>
                          ))}
                          {importResult.errors.length > 10 && (
                            <li className="text-muted-foreground">{t("successMoreWarnings", { more: importResult.errors.length - 10 })}</li>
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
                  <AlertTitle>{t("errorTitle")}</AlertTitle>
                  <AlertDescription className="space-y-2">
                    {importResult.importedCount > 0 ? (
                      <p dangerouslySetInnerHTML={{ __html: t("errorPartial", { count: importResult.importedCount, errors: importResult.errors.length }) }} />
                    ) : (
                      <p>{t("errorNone")}</p>
                    )}

                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">
                        {t("errorList", { count: importResult.errors.length })}
                      </summary>
                      <ul className="mt-2 text-xs space-y-1 max-h-32 overflow-y-auto">
                        {importResult.errors.slice(0, 10).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {importResult.errors.length > 10 && (
                          <li className="text-muted-foreground">{t("errorMore", { more: importResult.errors.length - 10 })}</li>
                        )}
                      </ul>
                    </details>
                  </AlertDescription>
                </Alert>
              )}

              {(importStatus === "success" || importStatus === "error") && (
                <div className="flex justify-center">
                  <Button onClick={resetImport} variant="outline">
                    {t("importAnother")}
                  </Button>
                </div>
              )}

              <div className="rounded-md bg-muted p-4">
                <h3 className="mb-2 font-medium">{t("formatTitle")}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t("formatDescription")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-red-600">•</span>
                      <span>{t("colName")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-red-600">•</span>
                      <span>{t("colCategory")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-red-600">•</span>
                      <span>{t("colTotal")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-orange-600">•</span>
                      <span>{t("colAvailable")}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-400">•</span>
                      <span>{t("colDescription")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-400">•</span>
                      <span>{t("colSerial")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-400">•</span>
                      <span>{t("colLocation")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-400">•</span>
                      <span>{t("colNote")}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Nota:</strong> {t("note")}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleDownloadTemplate} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t("downloadTemplate")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
