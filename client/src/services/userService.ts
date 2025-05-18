// src/services/userService.ts
export async function registerUser(data: {
  name: string
  email: string
  password: string
}) {
  const response = await fetch("http://localhost:5000/api/usuarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Error al registrar usuario")
  }

  return response.json()
}
