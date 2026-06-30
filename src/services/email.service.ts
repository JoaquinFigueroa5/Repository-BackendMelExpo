import nodemailer from 'nodemailer'
import { env } from '../config/env'

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    })
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: 'REMA — Código de verificación',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #2563EB;">REMA — Sistema de Gestión de Inventario</h2>
            <p>Tu código de verificación es:</p>
            <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; text-align: center; padding: 20px; background: #F3F4F6; border-radius: 12px; margin: 16px 0; color: #2563EB;">${code}</div>
            <p style="color: #6B7280; font-size: 14px;">Este código expira en 15 minutos.</p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
            <p style="color: #9CA3AF; font-size: 12px;">Si no solicitaste este código, ignora este mensaje.</p>
          </div>
        `,
      })
    } catch {
      console.warn(`[EmailService] No se pudo enviar email a ${email} — revisa credenciales SMTP`)
    }
  }

  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: 'REMA — Restablecimiento de contraseña',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #2563EB;">REMA — Sistema de Gestión de Inventario</h2>
            <p>Usa el siguiente código para restablecer tu contraseña:</p>
            <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; text-align: center; padding: 20px; background: #F3F4F6; border-radius: 12px; margin: 16px 0; color: #2563EB;">${code}</div>
            <p style="color: #6B7280; font-size: 14px;">Este código expira en 15 minutos.</p>
            <p style="color: #6B7280; font-size: 14px;">Si no solicitaste restablecer tu contraseña, ignora este mensaje.</p>
          </div>
        `,
      })
    } catch {
      console.warn(`[EmailService] No se pudo enviar email a ${email} — revisa credenciales SMTP`)
    }
  }
}

export const emailService = new EmailService()
