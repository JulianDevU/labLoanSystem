

import Cookies from "js-cookie"

export async function login({ correo, contrasena }: { correo: string; contrasena: string }) {
  const response = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ correo, contrasena }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.mensaje || "Error al iniciar sesión")
  }

  Cookies.set("token", result.token, {
    expires: 7,
    secure: false,
    sameSite: "Lax",
  })

  console.log(result.token)

  return result
}

export function isAuthenticated() {
  return !!Cookies.get("token")
}

export function getToken() {
  return Cookies.get("token")
}