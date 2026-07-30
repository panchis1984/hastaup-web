import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createContactDto: CreateContactDto) {
    // 1. Guardar el mensaje en la base de datos (Neon.tech)
    const newContact = await this.prisma.contactMessage.create({
      data: createContactDto,
    });

    // 2. Enviar el correo electrónico de notificación.
    // Si falla, se registra el error pero NO se lanza excepción:
    // el mensaje ya fue guardado, así que la operación principal tuvo éxito.
    const emailSent = await this.sendEmailNotification(createContactDto);

    return {
      success: true,
      message: 'Mensaje enviado y guardado con éxito',
      emailNotificationSent: emailSent,
      data: newContact,
    };
  }

  /**
   * Envía la notificación por correo al administrador.
   * Retorna `true` si el envío fue exitoso, `false` si falló.
   * Nunca lanza excepción para no interrumpir el flujo principal.
   */
  private async sendEmailNotification(dto: CreateContactDto): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.MAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Web Hasta Up" <${process.env.MAIL_USER}>`,
        to: process.env.MAIL_DESTINATION || process.env.MAIL_USER,
        subject: `Nuevo mensaje de contacto de ${dto.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">¡Has recibido una nueva consulta!</h2>
            <p><strong>Nombre:</strong> ${dto.name}</p>
            <p><strong>Email:</strong> ${dto.email}</p>
            <p><strong>Teléfono:</strong> ${dto.phone || 'No especificado'}</p>
            <p><strong>Mensaje:</strong></p>
            <blockquote style="background: #f3f4f6; padding: 15px; border-left: 4px solid #2563eb; margin: 10px 0;">
              ${dto.message}
            </blockquote>
          </div>
        `,
      });

      return true;
    } catch (error) {
      // Registramos el error pero no lo propagamos: el mensaje ya fue guardado en BD
      console.error('Error al enviar el correo de notificación:', error);
      return false;
    }
  }

  async findAll() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
