import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Resend } from 'resend';

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
    this.sendEmailNotification(createContactDto, newContact.id).then((sent) => {
      if (sent) {
        console.log(`📧 Email de notificación enviado para mensaje id=${newContact.id}`);
      } else {
        console.warn(`⚠️  Email NO enviado para mensaje id=${newContact.id}. Ver error arriba.`);
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
   * Envía la notificación por correo usando Resend (HTTP API — compatible con Railway).
   * Retorna `true` si el envío fue exitoso, `false` si falló.
   *
   * Variables de entorno requeridas:
   *   RESEND_API_KEY  → obtenida desde resend.com/dashboard → API Keys
   *   MAIL_FROM       → dirección remitente (ej: "noreply@tudominio.com")
   *                     Si no tenés dominio verificado en Resend, usá: "onboarding@resend.dev"
   *   MAIL_DESTINATION → dirección donde llegan las notificaciones (tu Gmail)
   */
  private async sendEmailNotification(dto: CreateContactDto, messageId: string): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    const mailDestination = process.env.MAIL_DESTINATION;
    const mailFrom = process.env.MAIL_FROM || 'onboarding@resend.dev';

    if (!apiKey) {
      console.error('❌ Email no configurado: RESEND_API_KEY no definida en las variables de entorno.');
      return false;
    }

    if (!mailDestination) {
      console.error('❌ Email no configurado: MAIL_DESTINATION no definida en las variables de entorno.');
      return false;
    }

    try {
      const resend = new Resend(apiKey);

      // Escapamos todos los valores del usuario antes de insertarlos en HTML
      const name    = this.escapeHtml(dto.name);
      const email   = this.escapeHtml(dto.email);
      const phone   = dto.phone ? this.escapeHtml(dto.phone) : 'No especificado';
      const message = this.escapeHtml(dto.message);

      const { error } = await resend.emails.send({
        from: `Web Hasta Up <${mailFrom}>`,
        to: [mailDestination],
        subject: `Nuevo mensaje de contacto de ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
              ¡Has recibido una nueva consulta!
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr>
                <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold; width: 120px;">Nombre</td>
                <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold;">Email</td>
                <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold;">Teléfono</td>
                <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${phone}</td>
              </tr>
            </table>
            <p style="font-weight: bold; margin-top: 20px;">Mensaje:</p>
            <blockquote style="background: #f3f4f6; padding: 15px; border-left: 4px solid #2563eb; margin: 10px 0; border-radius: 4px;">
              ${message}
            </blockquote>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
              Mensaje recibido vía formulario de contacto de Hasta Up · ID: ${messageId}
            </p>
          </div>
        `,
      });

      if (error) {
        console.error('❌ Error de Resend al enviar email:');
        console.error(`   Nombre:  ${error.name}`);
        console.error(`   Mensaje: ${error.message}`);
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('❌ Excepción inesperada al enviar email con Resend:');
      console.error(`   ${error?.message || error}`);
      return false;
    }
  }

  async findAll() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.contactMessage.delete({ where: { id } });
    } catch (e: any) {
      if (e?.code === 'P2025') {
        const { NotFoundException } = await import('@nestjs/common');
        throw new NotFoundException('Mensaje no encontrado');
      }
      throw e;
    }
  }
}
