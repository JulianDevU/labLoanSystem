import Cookies from "js-cookie"

export interface LoanFromApi {
  _id: string
  usuario_id: {
    _id: string
    nombre: string
    correo: string
    tipo: string
  }
  equipo_id: {
    _id: string
    nombre: string
    descripcion?: string
    categoria: string
    laboratorio_id: {
      _id: string
      nombre: string
      descripcion?: string
    }
  }
  fecha_prestamo: string
  fecha_devolucion: string
  fecha_devolucion_real?: string
  estado: 'activo' | 'devuelto' | 'vencido'
  evidencia_foto?: string
  createdAt: string
  updatedAt: string
}

interface CreateLoanData {
  usuario_id: string
  equipo_id: string
  fecha_devolucion: string
  evidencia_foto?: string
}

interface UpdateLoanData {
  fecha_devolucion?: string
  estado?: 'activo' | 'devuelto' | 'vencido'
  evidencia_foto?: string
}

interface LoansFilters {
  estado?: string
  usuario_id?: string
  equipo_id?: string
  laboratorio_id?: string
  desde?: string
  hasta?: string
  todos?: boolean
}

export async function createLoan(data: CreateLoanData) {
  console.log("FUNCIÓN createLoan LLAMADA CON DATOS:", data)

  const token = Cookies.get("token")

  if (!token) {
    console.error("No hay token de autenticación")
    throw new Error("No hay token de autenticación")
  }

  console.log("Token encontrado:", token.substring(0, 10) + "...")
  console.log("Preparando petición POST a http://localhost:5000/api/prestamos")

  try {
    const response = await fetch("http://localhost:5000/api/prestamos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    console.log("Respuesta recibida:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    })

    const result = await response.json()
    console.log("Datos de respuesta:", result)

    if (!response.ok) {
      console.error("Error en la respuesta:", result)
      throw new Error(result.mensaje || "Error al crear el préstamo")
    }

    return result
  } catch (error) {
    console.error("Error en la petición:", error)
    throw error
  }
}

export async function getLoans(filters?: LoansFilters): Promise<LoanFromApi[]> {
  const token = Cookies.get("token")

  if (!token) {
    throw new Error("No hay token de autenticación")
  }

  // Construir query string con filtros
  const queryParams = new URLSearchParams()
  
  if (filters) {
    if (filters.estado) queryParams.append("estado", filters.estado)
    if (filters.usuario_id) queryParams.append("usuario_id", filters.usuario_id)
    if (filters.equipo_id) queryParams.append("equipo_id", filters.equipo_id)
    if (filters.laboratorio_id) queryParams.append("laboratorio_id", filters.laboratorio_id)
    if (filters.desde) queryParams.append("desde", filters.desde)
    if (filters.hasta) queryParams.append("hasta", filters.hasta)
    if (filters.todos) queryParams.append("todos", filters.todos.toString())
  }

  const url = `http://localhost:5000/api/prestamos${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
  console.log("Obteniendo préstamos con URL:", url)

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const result = await response.json()

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error
    throw new Error(fallbackMessage || "Error al obtener préstamos")
  }

  return result.data
}

export async function getLoanById(id: string): Promise<LoanFromApi> {
  const token = Cookies.get("token")

  if (!token) {
    throw new Error("No hay token de autenticación")
  }

  const response = await fetch(`http://localhost:5000/api/prestamos/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const result = await response.json()

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error
    throw new Error(fallbackMessage || "Error al obtener préstamo")
  }

  return result.data
}

export async function updateLoan(id: string, data: UpdateLoanData) {
  const token = Cookies.get("token")

  if (!token) {
    throw new Error("No hay token de autenticación")
  }

  console.log("Actualizando préstamo:", id, "con datos:", data)

  const response = await fetch(`http://localhost:5000/api/prestamos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error
    throw new Error(fallbackMessage || "Error al actualizar préstamo")
  }

  return result.data
}

export async function deleteLoan(id: string): Promise<void> {
  const token = Cookies.get("token")

  if (!token) {
    throw new Error("No hay token de autenticación")
  }

  const response = await fetch(`http://localhost:5000/api/prestamos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const result = await response.json()

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error
    throw new Error(fallbackMessage || "Error al eliminar préstamo")
  }

  return
}

export async function generateLoanPDF(id: string): Promise<{ url: string; fileName: string }> {
  const token = Cookies.get("token")

  if (!token) {
    throw new Error("No hay token de autenticación")
  }

  const response = await fetch(`http://localhost:5000/api/prestamos/${id}/pdf`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const result = await response.json()

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error
    throw new Error(fallbackMessage || "Error al generar PDF del préstamo")
  }

  return result.data
}

export async function generateLoansReport(filters?: LoansFilters): Promise<{ url: string; fileName: string; count: number }> {
  const token = Cookies.get("token")

  if (!token) {
    throw new Error("No hay token de autenticación")
  }

  // Construir query string con filtros
  const queryParams = new URLSearchParams()
  
  if (filters) {
    if (filters.estado) queryParams.append("estado", filters.estado)
    if (filters.laboratorio_id) queryParams.append("laboratorio_id", filters.laboratorio_id)
    if (filters.desde) queryParams.append("desde", filters.desde)
    if (filters.hasta) queryParams.append("hasta", filters.hasta)
  }

  const url = `http://localhost:5000/api/prestamos/reporte${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const result = await response.json()

  if (!response.ok) {
    const fallbaseMessage = result?.mensaje || result?.error
    throw new Error(fallbaseMessage || "Error al generar reporte de préstamos")
  }

  return result.data
}

export async function checkOverdueLoans(): Promise<{ vencidos: number; porVencer: number; total: number }> {
  const token = Cookies.get("token")

  if (!token) {
    throw new Error("No hay token de autenticación")
  }

  const response = await fetch("http://localhost:5000/api/prestamos/verificar-vencidos", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const result = await response.json()

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error
    throw new Error(fallbackMessage || "Error al verificar préstamos vencidos")
  }

  return result.data
}

// Función para obtener préstamos por laboratorio específicamente
export async function getLoansByLaboratory(laboratoryId: string): Promise<LoanFromApi[]> {
  return getLoans({ laboratorio_id: laboratoryId })
}

// Función para obtener préstamos de un usuario específico
export async function getLoansByUser(userId: string): Promise<LoanFromApi[]> {
  return getLoans({ usuario_id: userId })
}

// Función para obtener préstamos de un equipo específico
export async function getLoansByEquipment(equipmentId: string): Promise<LoanFromApi[]> {
  return getLoans({ equipo_id: equipmentId })
}

// Función para obtener préstamos activos
export async function getActiveLoans(): Promise<LoanFromApi[]> {
  return getLoans({ estado: 'activo' })
}

// Función para obtener préstamos vencidos
export async function getOverdueLoans(): Promise<LoanFromApi[]> {
  return getLoans({ estado: 'vencido' })
}

// Función para obtener préstamos devueltos
export async function getReturnedLoans(): Promise<LoanFromApi[]> {
  return getLoans({ estado: 'devuelto' })
}