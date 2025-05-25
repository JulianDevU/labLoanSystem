import * as XLSX from "xlsx"
import { getLoans } from "@/src/services/loanService"

interface LoanExportData {
  numero_prestamo: string
  tipo_beneficiado: string
  numero_identificacion: string
  nombre_beneficiado: string
  correo_beneficiado: string
  equipos: string
  cantidades: string
  fecha_prestamo: string
  fecha_devolucion: string
  fecha_devolucion_real: string
  estado: string
  laboratorio: string
  descripcion: string
  dias_vencido: string
}

interface ExportFilters {
  estado?: string
  desde?: string
  hasta?: string
  equipos?: Array<{
    equipo_id: {
      _id: string;
      nombre: string;
      descripcion?: string;
      categoria: string;
      laboratorio_id: {
        _id: string;
        nombre: string;
        descripcion?: string;
      };
    };
    cantidad: number;
  }>;
  laboratorio_id?: {
    _id: string;
    nombre: string;
    descripcion?: string;
  };
}

export async function exportLoansToExcel(filters: ExportFilters = {}): Promise<void> {
  try {
    console.log("Iniciando exportación de préstamos con filtros:", filters)

    // Obtener los préstamos desde la API
    const loans = await getLoans()

    console.log("Préstamos obtenidos:", loans.length)

    if (!loans || loans.length === 0) {
      throw new Error("No hay préstamos para exportar con los filtros aplicados")
    }

    // Transformar los datos para Excel
    const excelData: LoanExportData[] = loans.map((loan: any, index: number) => {
      // Concatenar todos los equipos y sus cantidades
      const equiposNombres = loan.equipos
        ?.map((eq: any) => eq.equipo_id?.nombre || 'N/A')
        .join(', ') || 'N/A'
      
      const equiposCantidades = loan.equipos
        ?.map((eq: any) => eq.cantidad || 1)
        .join(', ') || '1'

      // Calcular días vencido si aplica
      let diasVencido = ''
      if (loan.estado === 'vencido' && loan.fecha_devolucion) {
        const fechaDevolucion = new Date(loan.fecha_devolucion)
        const hoy = new Date()
        const diferencia = Math.floor((hoy.getTime() - fechaDevolucion.getTime()) / (1000 * 60 * 60 * 24))
        diasVencido = diferencia > 0 ? `${diferencia} días` : '0 días'
      }

      return {
        numero_prestamo: `PREST-${String(index + 1).padStart(4, '0')}`,
        tipo_beneficiado: loan.tipo_beneficiado || 'N/A',
        numero_identificacion: loan.numero_identificacion || 'N/A',
        nombre_beneficiado: loan.nombre_beneficiado || 'N/A',
        correo_beneficiado: loan.correo_beneficiado || 'N/A',
        equipos: equiposNombres,
        cantidades: equiposCantidades,
        fecha_prestamo: loan.fecha_prestamo 
          ? new Date(loan.fecha_prestamo).toLocaleDateString('es-CO')
          : 'N/A',
        fecha_devolucion: loan.fecha_devolucion
          ? new Date(loan.fecha_devolucion).toLocaleDateString('es-CO')
          : 'N/A',
        fecha_devolucion_real: loan.fecha_devolucion_real
          ? new Date(loan.fecha_devolucion_real).toLocaleDateString('es-CO')
          : 'Pendiente',
        estado: getEstadoDisplay(loan.estado),
        laboratorio: loan.laboratorio_id?.nombre || 'N/A',
        descripcion: loan.descripcion || '',
        dias_vencido: diasVencido
      }
    })

    // Crear el workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData, {
      header: [
        'numero_prestamo',
        'tipo_beneficiado', 
        'numero_identificacion',
        'nombre_beneficiado',
        'correo_beneficiado',
        'equipos',
        'cantidades',
        'fecha_prestamo',
        'fecha_devolucion',
        'fecha_devolucion_real',
        'estado',
        'laboratorio',
        'descripcion',
        'dias_vencido'
      ]
    })

    // Personalizar encabezados
    const headers = {
      A1: { v: 'Nº Préstamo' },
      B1: { v: 'Tipo Beneficiado' },
      C1: { v: 'Nº Identificación' },
      D1: { v: 'Nombre Beneficiado' },
      E1: { v: 'Correo Electrónico' },
      F1: { v: 'Equipos Prestados' },
      G1: { v: 'Cantidades' },
      H1: { v: 'Fecha Préstamo' },
      I1: { v: 'Fecha Devolución Programada' },
      J1: { v: 'Fecha Devolución Real' },
      K1: { v: 'Estado' },
      L1: { v: 'Laboratorio' },
      M1: { v: 'Descripción' },
      N1: { v: 'Días Vencido' }
    }

    Object.keys(headers).forEach(cell => {
      if (worksheet[cell]) {
        worksheet[cell].v = headers[cell as keyof typeof headers].v
      }
    })

    // Establecer ancho de columnas
    const columnWidths = [
      { wch: 15 }, // Nº Préstamo
      { wch: 15 }, // Tipo Beneficiado
      { wch: 18 }, // Nº Identificación
      { wch: 25 }, // Nombre Beneficiado
      { wch: 30 }, // Correo Electrónico
      { wch: 40 }, // Equipos Prestados
      { wch: 12 }, // Cantidades
      { wch: 15 }, // Fecha Préstamo
      { wch: 20 }, // Fecha Devolución Programada
      { wch: 20 }, // Fecha Devolución Real
      { wch: 12 }, // Estado
      { wch: 20 }, // Laboratorio
      { wch: 30 }, // Descripción
      { wch: 12 }  // Días Vencido
    ]
    worksheet["!cols"] = columnWidths

    // Crear workbook y agregar hoja
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial Préstamos")

    // Generar nombre de archivo con fecha y filtros aplicados
    const fechaActual = new Date().toISOString().split('T')[0]
    let fileName = `historial_prestamos_${fechaActual}`
    
    if (filters.estado && filters.estado !== 'todos') {
      fileName += `_${filters.estado}`
    }
    if (filters.laboratorio_id) {
      fileName += `_lab`
    }
    
    fileName += '.xlsx'

    // Descargar archivo
    XLSX.writeFile(workbook, fileName)

    console.log("Exportación completada:", fileName)

  } catch (error) {
    console.error("Error en exportación de préstamos:", error)
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Error desconocido al exportar préstamos"
    )
  }
}

export async function exportLoansSummaryToExcel(filters: ExportFilters = {}): Promise<void> {
  try {
    console.log("Iniciando exportación de resumen de préstamos")

    const loans = await getLoans()

    if (!loans || loans.length === 0) {
      throw new Error("No hay préstamos para generar el resumen")
    }

    // Crear estadísticas de resumen
    const summary = {
      total: loans.length,
      activos: loans.filter((l: any) => l.estado === 'activo').length,
      devueltos: loans.filter((l: any) => l.estado === 'devuelto').length,
      vencidos: loans.filter((l: any) => l.estado === 'vencido').length
    }

    // Agrupar por laboratorio
    const porLaboratorio = loans.reduce((acc: any, loan: any) => {
      const labNombre = loan.laboratorio_id?.nombre || 'Sin laboratorio'
      if (!acc[labNombre]) {
        acc[labNombre] = { total: 0, activos: 0, devueltos: 0, vencidos: 0 }
      }
      acc[labNombre].total++
      acc[labNombre][loan.estado]++
      return acc
    }, {})

    // Agrupar por tipo de beneficiado
    const porTipo = loans.reduce((acc: any, loan: any) => {
      const tipo = loan.tipo_beneficiado || 'Sin especificar'
      if (!acc[tipo]) {
        acc[tipo] = 0
      }
      acc[tipo]++
      return acc
    }, {})

    // Crear hojas del workbook
    const workbook = XLSX.utils.book_new()

    // Hoja 1: Resumen General
    const resumenData = [
      ['Métrica', 'Cantidad'],
      ['Total de Préstamos', summary.total],
      ['Préstamos Activos', summary.activos],
      ['Préstamos Devueltos', summary.devueltos],
      ['Préstamos Vencidos', summary.vencidos],
      [''],
      ['Resumen por Tipo de Beneficiado', ''],
      ...Object.entries(porTipo).map(([tipo, cantidad]) => [tipo, cantidad])
    ]

    const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData)
    resumenSheet["!cols"] = [{ wch: 25 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(workbook, resumenSheet, "Resumen General")

    // Hoja 2: Por Laboratorio
    const labData = [
      ['Laboratorio', 'Total', 'Activos', 'Devueltos', 'Vencidos'],
      ...Object.entries(porLaboratorio).map(([lab, stats]: [string, any]) => [
        lab, stats.total, stats.activos, stats.devueltos, stats.vencidos
      ])
    ]

    const labSheet = XLSX.utils.aoa_to_sheet(labData)
    labSheet["!cols"] = [{ wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }]
    XLSX.utils.book_append_sheet(workbook, labSheet, "Por Laboratorio")

    // Descargar
    const fechaActual = new Date().toISOString().split('T')[0]
    XLSX.writeFile(workbook, `resumen_prestamos_${fechaActual}.xlsx`)

  } catch (error) {
    console.error("Error en exportación de resumen:", error)
    throw error
  }
}

// Función auxiliar para mostrar el estado de manera legible
function getEstadoDisplay(estado: string): string {
  const estados = {
    'activo': 'Activo',
    'devuelto': 'Devuelto',
    'vencido': 'Vencido'
  }
  return estados[estado as keyof typeof estados] || estado
}