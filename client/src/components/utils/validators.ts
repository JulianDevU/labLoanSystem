// src/lib/validation/registerSchema.ts
import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  correo: z.string().email("Correo electrónico inválido"),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
