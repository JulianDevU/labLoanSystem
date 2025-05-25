// src/services/userService.ts
import Cookies from "js-cookie"

const BASE_URL = process.env.NEXT_PUBLIC_BACK_ENV

export async function registerUser(data: {
  nombre: string
  correo: string
  contrasena: string
}) {
  const response = await fetch(`${BASE_URL}/api/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || "Error al registrar usuario")
  }

  Cookies.set("token", result.token, {
    expires: 7,
    secure: false,
    sameSite: "Lax",
  })

  return result
}

export async function getUser() {
  const token = Cookies.get("token")

  const response = await fetch(`${BASE_URL}/api/usuarios/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  const result = await response.json()

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage);
  }

  return result.data
}
