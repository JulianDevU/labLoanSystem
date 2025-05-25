// app/api/loan-notification/route.ts
import { NextResponse } from "next/server"
import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function POST(req: Request) {
  const {
    beneficiaryName,
    beneficiaryEmail,
    laboratoryName,
    equipmentList,
    loanDate,
    returnDate,
  } = await req.json()

  // Validar que todos los campos requeridos estén presentes
  if (!beneficiaryName || !beneficiaryEmail || !laboratoryName || !equipmentList || !loanDate || !returnDate) {
    return NextResponse.json({ message: "Faltan campos requeridos" }, { status: 400 })
  }

  try {
    // Crear la lista de equipos formateada
    const equipmentListFormatted = equipmentList
      .map((item: any) => `• ${item.name} (Cantidad: ${item.quantity})`)
      .join('\n')

    // Formatear las fechas con zona horaria de Colombia
    const loanDateFormatted = new Date(loanDate).toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const returnDateFormatted = new Date(returnDate).toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // 1. Correo para el beneficiario usando la plantilla de SendGrid
    await sgMail.send({
      to: beneficiaryEmail,
      from: process.env.FROM_EMAIL as string,
      replyTo: process.env.REPLY_EMAIL as string,
      templateId: process.env.SENDGRID_LOAN_EMAIL_TEMPLATE_ID as string,
      dynamicTemplateData: {
        beneficiaryName,
        laboratoryName,
        equipmentList: equipmentListFormatted,
        loanDate: loanDateFormatted,
        returnDate: returnDateFormatted,
        // Agregar campos adicionales que pueda necesitar tu plantilla
        equipmentCount: equipmentList.length,
        currentYear: new Date().getFullYear(),
      },
    })

    // 2. Correo para ti con los datos del préstamo (mantener HTML manual para notificación interna)
    await sgMail.send({
      to: process.env.TO_EMAIL as string,
      from: process.env.FROM_EMAIL as string,
      replyTo: beneficiaryEmail,
      subject: `Nuevo Préstamo Registrado - ${beneficiaryName}`,
      text: `Nuevo préstamo registrado:\n\nBeneficiario: ${beneficiaryName}\nEmail: ${beneficiaryEmail}\nLaboratorio: ${laboratoryName}\nFecha de préstamo: ${loanDateFormatted}\nFecha de devolución: ${returnDateFormatted}\n\nEquipos:\n${equipmentListFormatted}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">🚨 Nuevo Préstamo Registrado</h2>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
            <p><strong>Beneficiario:</strong> ${beneficiaryName}</p>
            <p><strong>Email:</strong> ${beneficiaryEmail}</p>
            <p><strong>Laboratorio:</strong> ${laboratoryName}</p>
            <p><strong>Fecha de Préstamo:</strong> ${loanDateFormatted}</p>
            <p><strong>Fecha de Devolución:</strong> ${returnDateFormatted}</p>
            
            <h3>Equipos Prestados:</h3>
            <div style="background-color: white; padding: 15px; border-radius: 5px;">
              <pre style="font-family: Arial, sans-serif; white-space: pre-line; margin: 0;">${equipmentListFormatted}</pre>
            </div>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ message: "Notificaciones enviadas con éxito" }, { status: 200 })
  } catch (error) {
    console.error("Error al enviar las notificaciones:", error)
    return NextResponse.json({ message: "Error al enviar las notificaciones" }, { status: 500 })
  }
}