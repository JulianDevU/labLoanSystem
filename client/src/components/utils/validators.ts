// src/lib/validation/registerSchema.ts
import { z } from "zod"


// Para internacionalizar los mensajes de validación, exporta una función que reciba t
export function getRegisterSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(3, t("nameMin")),
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(6, t("passwordMin")),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("passwordsMismatch"),
    path: ["confirmPassword"],
  })
}

export function getLoginSchema(t: (key: string) => string) {
  return z.object({
    correo: z.string().email(t("invalidEmail")),
    contrasena: z.string().min(6, t("passwordMin")),
  })
}

// Tipos para los esquemas internacionalizados
export type LoginSchema = z.infer<ReturnType<typeof getLoginSchema>>
export type RegisterSchema = z.infer<ReturnType<typeof getRegisterSchema>>
