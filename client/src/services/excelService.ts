import * as XLSX from "xlsx"
import { registerEquipment } from "@/src/services/equipmentService" // Asegúrate que esta ruta sea correcta
import { getLaboratories } from "@/src/services/laboratoryService" // Importamos el servicio de laboratorios

interface EquipmentImportData {
  nombre: string
  descripcion?: string
  categoria: string
  numero_serie?: string
  cantidad_total: number
  cantidad_disponible: number
  ubicacion?: string
  nota_adicional?: string
}

interface ImportResult {
  success: boolean
  importedCount: number
  errors: string[]
  skippedRows: number
}

export async function importEquipmentFromExcel(file: File, labSlug: string): Promise<ImportResult> {
  console.log("Iniciando procesamiento de Excel con laboratorio slug:", labSlug)

  // Primero obtenemos el ID real del laboratorio a partir del slug
  let laboratorioId = ""
  try {
    const labsResponse = await getLaboratories()
    const labs = labsResponse.data
    console.log("Laboratorios disponibles:", labs)

    const selectedLab = labs.find((lab: any) => lab.slug === labSlug)
    if (!selectedLab) {
      throw new Error(`No se encontró el laboratorio con slug: ${labSlug}`)
    }

    laboratorioId = selectedLab._id
    console.log("Laboratorio encontrado:", selectedLab.nombre, "ID:", laboratorioId)
  } catch (error) {
    console.error("Error al obtener laboratorios:", error)
    throw new Error("No se pudo obtener el ID del laboratorio seleccionado")
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        console.log("Archivo Excel cargado, comenzando procesamiento")

        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        console.log("Datos extraídos del Excel:", jsonData.length, "filas")

        if (jsonData.length < 2) {
          throw new Error("El archivo debe contener al menos una fila de encabezados y una fila de datos")
        }

        // Obtener encabezados y normalizar
        const headers = jsonData[0].map((header: string) => header?.toString().toLowerCase().trim())
        console.log("Encabezados detectados:", headers)

        // Mapear columnas esperadas
        const columnMap = {
          nombre: findColumnIndex(headers, ["nombre", "name", "equipo"]),
          descripcion: findColumnIndex(headers, ["descripcion", "description", "desc"]),
          categoria: findColumnIndex(headers, ["categoria", "category", "tipo"]),
          numero_serie: findColumnIndex(headers, ["numero_serie", "numero de serie", "serial", "serie"]),
          cantidad_total: findColumnIndex(headers, ["cantidad_total", "cantidad total", "total", "cantidad"]),
          cantidad_disponible: findColumnIndex(headers, ["cantidad_disponible", "cantidad disponible", "disponible"]),
          ubicacion: findColumnIndex(headers, ["ubicacion", "location", "lugar"]),
          nota_adicional: findColumnIndex(headers, [
            "nota_adicional",
            "notas",
            "notes",
            "observaciones",
            "comentarios",
          ]),
        }

        console.log("Mapeo de columnas:", columnMap)

        // Validar columnas obligatorias
        const requiredFields = ["nombre", "categoria", "cantidad_total"]
        const missingFields = requiredFields.filter((field) => columnMap[field as keyof typeof columnMap] === -1)

        if (missingFields.length > 0) {
          throw new Error(`Faltan las siguientes columnas obligatorias: ${missingFields.join(", ")}`)
        }

        // Procesar filas de datos
        const dataRows = jsonData.slice(1)
        let importedCount = 0
        let skippedRows = 0
        const errors: string[] = []

        console.log("Procesando", dataRows.length, "filas de datos")

        // Procesar cada fila secuencialmente para evitar problemas de concurrencia
        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i]
          const rowNumber = i + 2 // +2 porque empezamos desde la fila 1 (índice 0) y saltamos el header

          try {
            // Saltar filas vacías
            if (!row || row.every((cell) => !cell || cell.toString().trim() === "")) {
              skippedRows++
              continue
            }

            const equipmentData: EquipmentImportData = {
              nombre: getCellValue(row, columnMap.nombre),
              descripcion: getCellValue(row, columnMap.descripcion) || "",
              categoria: getCellValue(row, columnMap.categoria),
              numero_serie: getCellValue(row, columnMap.numero_serie) || "",
              cantidad_total: parseNumber(getCellValue(row, columnMap.cantidad_total)),
              cantidad_disponible: parseNumber(getCellValue(row, columnMap.cantidad_disponible)),
              ubicacion: getCellValue(row, columnMap.ubicacion) || "",
              nota_adicional: getCellValue(row, columnMap.nota_adicional) || "",
            }

            console.log(`Procesando fila ${rowNumber}:`, equipmentData)

            // Validar datos obligatorios
            if (!equipmentData.nombre?.trim()) {
              errors.push(`Fila ${rowNumber}: El nombre es obligatorio`)
              continue
            }

            if (!equipmentData.categoria?.trim()) {
              errors.push(`Fila ${rowNumber}: La categoría es obligatoria`)
              continue
            }

            if (isNaN(equipmentData.cantidad_total) || equipmentData.cantidad_total <= 0) {
              errors.push(`Fila ${rowNumber}: La cantidad total debe ser un número mayor a 0`)
              continue
            }

            // Si no se especifica cantidad_disponible, usar cantidad_total
            if (isNaN(equipmentData.cantidad_disponible) || equipmentData.cantidad_disponible < 0) {
              equipmentData.cantidad_disponible = equipmentData.cantidad_total
            }

            // Validar que cantidad_disponible no sea mayor que cantidad_total
            if (equipmentData.cantidad_disponible > equipmentData.cantidad_total) {
              errors.push(
                `Fila ${rowNumber}: La cantidad disponible (${equipmentData.cantidad_disponible}) no puede ser mayor que la cantidad total (${equipmentData.cantidad_total})`,
              )
              continue
            }

            // Registrar equipo - Aquí está la llamada a la API
            console.log(`Enviando datos de fila ${rowNumber} a la API:`, {
              ...equipmentData,
              laboratorio_id: laboratorioId,
            })

            try {
              // Crear el objeto de datos exactamente igual que en new-inventory-item-page
              const payload = {
                nombre: equipmentData.nombre.trim(),
                descripcion: equipmentData.descripcion,
                categoria: equipmentData.categoria.trim(),
                cantidad_total: equipmentData.cantidad_total,
                numero_serie: equipmentData.numero_serie,
                cantidad_disponible: equipmentData.cantidad_disponible,
                ubicacion: equipmentData.ubicacion,
                nota_adicional: equipmentData.nota_adicional,
                laboratorio_id: laboratorioId,
              }

              // Llamar a registerEquipment con el mismo formato que en new-inventory-item-page
              const result = await registerEquipment(payload)
              console.log(`Equipo registrado con éxito:`, result)
              importedCount++
            } catch (apiError) {
              console.error(`Error al registrar equipo en fila ${rowNumber}:`, apiError)
              const errorMessage = apiError instanceof Error ? apiError.message : "Error al registrar equipo"
              errors.push(`Fila ${rowNumber}: ${errorMessage}`)
            }
          } catch (rowError) {
            console.error(`Error procesando fila ${rowNumber}:`, rowError)
            const errorMessage = rowError instanceof Error ? rowError.message : "Error desconocido"
            errors.push(`Fila ${rowNumber}: ${errorMessage}`)
          }
        }

        console.log("Procesamiento completado:", {
          importedCount,
          errors: errors.length,
          skippedRows,
        })

        resolve({
          success: importedCount > 0,
          importedCount,
          errors,
          skippedRows,
        })
      } catch (error) {
        console.error("Error general en procesamiento de Excel:", error)
        const errorMessage = error instanceof Error ? error.message : "Error al procesar el archivo"
        reject(new Error(errorMessage))
      }
    }

    reader.onerror = (error) => {
      console.error("Error al leer el archivo:", error)
      reject(new Error("Error al leer el archivo"))
    }

    reader.readAsArrayBuffer(file)
  })
}

export function generateExcelTemplate(): void {
  const templateData = [
    [
      "nombre",
      "descripcion",
      "categoria",
      "numero_serie",
      "cantidad_total",
      "cantidad_disponible",
      "ubicacion",
      "nota_adicional",
    ],
    [
      "Microscopio Óptico",
      "Microscopio con aumento 1000x",
      "Instrumentos",
      "MIC-001",
      "2",
      "2",
      "Mesa 1",
      "Revisar calibración mensual",
    ],
    [
      "Probeta 100ml",
      "Probeta graduada de vidrio",
      "Cristalería",
      "PROB-100-001",
      "10",
      "8",
      "Estante A",
      "2 unidades en mantenimiento",
    ],
    [
      "Balanza Analítica",
      "Balanza de precisión 0.1mg",
      "Instrumentos",
      "BAL-2023-001",
      "1",
      "1",
      "Mesa Central",
      "Requiere calibración anual",
    ],
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(templateData)

  // Establecer ancho de columnas
  const columnWidths = [
    { wch: 20 }, // Nombre
    { wch: 25 }, // Descripción
    { wch: 15 }, // Categoría
    { wch: 18 }, // Número de Serie
    { wch: 15 }, // Cantidad Total
    { wch: 18 }, // Cantidad Disponible
    { wch: 15 }, // Ubicación
    { wch: 30 }, // Nota Adicional
  ]
  worksheet["!cols"] = columnWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario")

  // Descargar archivo
  XLSX.writeFile(workbook, "plantilla_inventario.xlsx")
}

// Funciones auxiliares
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex((header) => header && header.includes(name.toLowerCase()))
    if (index !== -1) return index
  }
  return -1
}

function getCellValue(row: any[], columnIndex: number): string {
  if (columnIndex === -1 || !row[columnIndex]) return ""
  return row[columnIndex].toString().trim()
}

function parseNumber(value: string): number {
  if (!value) return 0
  const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ""))
  return isNaN(parsed) ? 0 : parsed
}
