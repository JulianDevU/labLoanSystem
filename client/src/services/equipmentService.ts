import Cookies from "js-cookie"

const BASE_URL = process.env.NEXT_PUBLIC_BACK_ENV

interface EquipmentFromApi {
  _id: string
  nombre: string
  descripcion?: string
  categoria: string
  cantidad_total: number
  cantidad_disponible?: number
  numero_serie?: string
  ubicacion?: string
  nota_adicional?: string
  laboratorio_id: {
    _id: string
    nombre: string
    slug: string
    descripcion?: string
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
  console.log("FUNCIÓN registerEquipment LLAMADA CON DATOS:", data)

  const token = Cookies.get("token")

  if (!token) {
    console.error("No hay token de autenticación")
    throw new Error("No hay token de autenticación")
  }

  try {
    const response = await fetch(`${BASE_URL}/api/equipos`, {
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

  const response = await fetch(`${BASE_URL}/api/equipos`, {
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

export async function deleteEquipment(id: string): Promise<void> {
  const token = Cookies.get("token")

  if (!token) {
    throw new Error("No hay token de autenticación")
  }

  const response = await fetch(`${BASE_URL}/api/equipos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const result = await response.json()

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error
    throw new Error(fallbackMessage || "Error al eliminar equipo")
  }

  return
}

export async function getEquipmentById(id: string): Promise<EquipmentFromApi> {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(`${BASE_URL}/api/equipos/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al obtener equipo");
  }

  return result.data;
}

export async function updateEquipment(id: string, data: Partial<Omit<EquipmentFromApi, '_id' | 'laboratorio_id'>> & { laboratorio_id?: string }) {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(`${BASE_URL}/api/equipos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al actualizar equipo");
  }

  return result.data;
}

export async function getEquipmentCategories(): Promise<string[]> {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(`${BASE_URL}/api/equipos/categorias`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al obtener categorías");
  }

  return result.data;
}

