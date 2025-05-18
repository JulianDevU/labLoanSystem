// src/services/userService.ts
import Cookies from "js-cookie"

export async function registerUser(data: {
  nombre: string
  correo: string
  contrasena: string
}) {
  const response = await fetch("http://localhost:5000/api/usuarios", {
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
    expires: 7, // Días
    secure: false,
    sameSite: "Lax",
  })

  return result
}
