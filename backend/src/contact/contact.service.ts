import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createContactDto: CreateContactDto) {
    // 1. Guardar el mensaje en la base de datos
    const newContact = await this.prisma.contactMessage.create({
      data: createContactDto,
    });

    // 2. Disparar el email de forma NO bloqueante (fire-and-forget).
    // El usuario recibe respuesta inmediata. Si el email falla, queda
    // registrado en los logs de Railway pero NO afecta la respuesta HTTP.
    this.sendEmailNotification(createContactDto).then((sent) => {
      if (sent) {
        console.log(`📧 Email de notificación enviado para mensaje id=${newContact.id}`);
      } else {
        console.warn(`⚠️  Email de notificación NO enviado para mensaje id=${newContact.id}. Ver error arriba.`);
      }
    });

    return {
      success: true,
      message: 'Mensaje enviado y guardado con éxito',
      data: newContact,
    };
  }

  /**
   * Escapa caracteres especiales HTML para prevenir XSS/HTML injection
   * en el cuerpo del correo de notificación.
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Envía la notificación por correo al administrador.
   * Retorna `true` si el envío fue exitoso, `false` si falló.
   * Nunca lanza excepción para no interrumpir el flujo principal.
   *
   * Configuración SMTP:
   * - Puerto 465 + secure:true (SSL directo) — mejor compatibilidad en Railway
   * - connectionTimeout: 10s — falla rápido si el puerto está bloqueado
   * - socketTimeout: 15s — falla rápido si la conexión se cuelga durante el envío
   */
  private async sendEmailNotification(dto: CreateContactDto): Promise<boolean> {
    const mailUser = process.env.MAIL_USER;
    const mailPass = process.env.MAIL_PASS;

    if (!mailUser || !mailPass) {
      console.error('❌ Email no configurado: MAIL_USER o MAIL_PASS no definidos en las variables de entorno.');
      return false;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.MAIL_PORT) || 465,
        secure: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) === 465 : true, // true = SSL en 465
        auth: {
          user: mailUser,
          pass: mailPass,
        },
        connectionTimeout: 10_000, // 10 segundos — si Railway bloquea el puerto, falla rápido
        socketTimeout: 15_000,     // 15 segundos — timeout durante la transmisión del mensaje
      });

      // Escapamos todos los valores del usuario antes de insertarlos en HTML
      const name    = this.escapeHtml(dto.name);
      const email   = this.escapeHtml(dto.email);
      const phone   = dto.phone ? this.escapeHtml(dto.phone) : 'No especificado';
      const message = this.escapeHtml(dto.message);

      await transporter.sendMail({
        from: `"Web Hasta Up" <${mailUser}>`,
        to: process.env.MAIL_DESTINATION || mailUser,
        subject: `Nuevo mensaje de contacto de ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">¡Has recibido una nueva consulta!</h2>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Teléfono:</strong> ${phone}</p>
            <p><strong>Mensaje:</strong></p>
            <blockquote style="background: #f3f4f6; padding: 15px; border-left: 4px solid #2563eb; margin: 10px 0;">
              ${message}
            </blockquote>
          </div>
        `,
      });

      return true;
    } catch (error: any) {
      // Log detallado para ver el motivo exacto en Railway → Logs
      console.error('❌ Error al enviar el correo de notificación:');
      console.error(`   Código:   ${error?.code || 'N/A'}`);
      console.error(`   Mensaje:  ${error?.message || error}`);
      console.error(`   Respuesta SMTP: ${error?.response || 'N/A'}`);
      return false;
    }
  }

  async findAll() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
