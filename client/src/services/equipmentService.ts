import Cookies from "js-cookie"

interface EquipmentFromApi {
  _id: string
  nombre: string
  categoria: string
  cantidad_total: number
  ubicacion: string
  laboratorio_id: {
    _id: string
    nombre: string
  }
}

export async function registerEquipment(data: {
  nombre: string
  descripcion?: string
  categoria: string
  cantidad_total: number
  numero_serie?: string
  cantidad_disponible: number
  ubicacion?: string
  nota_adicional?: string
  laboratorio_id: string
}) {
  console.log("🔴 FUNCIÓN registerEquipment LLAMADA CON DATOS:", data)

  const token = Cookies.get("token")

  if (!token) {
    console.error("No hay token de autenticación")
    throw new Error("No hay token de autenticación")
  }

  console.log("Token encontrado:", token.substring(0, 10) + "...")
  console.log("Preparando petición POST a http://localhost:5000/api/equipos")

  try {
    const response = await fetch("http://localhost:5000/api/equipos", {
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
      throw new Error(result.message || "Error al registrar el equipo")
    }

    return result
  } catch (error) {
    console.error("Error en la petición:", error)
    throw error
  }
}

export async function getEquipment(): Promise<EquipmentFromApi[]> {
  const token = Cookies.get("token")

  if (!token) {
    throw new Error("No hay token de autenticación")
  }

  const response = await fetch("http://localhost:5000/api/equipos", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const result = await response.json()

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error
    throw new Error(fallbackMessage || "Error al obtener equipos")
  }

  return result.data
}
