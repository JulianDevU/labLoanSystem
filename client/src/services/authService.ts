import Cookies from "js-cookie"

export function logout() {
  Cookies.remove("token")
}

export async function changePassword(data: {
  contrasenaActual: string,
  nuevaContrasena: string,
  confirmarContrasena: string
}) {
  const token = Cookies.get("token")

  if (!token) {
    console.error("No hay token de autenticación")
    throw new Error("No hay token de autenticación")
  }

  const response = await fetch("http://localhost:5000/api/auth/cambiar-contrasena", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  const result = await response.json();

  if (!response.ok) {
    const fallbackMessage = result?.mensaje || result?.error;
    throw new Error(fallbackMessage || "Error al actualizar equipo");
  }

  return await result.data;
}