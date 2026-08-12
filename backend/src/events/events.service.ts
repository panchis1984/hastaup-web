import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: createEventDto.title,
        description: createEventDto.description,
        date: new Date(createEventDto.date),
        time: createEventDto.time,
        location: createEventDto.location,
        category: createEventDto.category || 'Subasta',
        imageUrl: createEventDto.imageUrl,
        images: createEventDto.images || [],
      },
    });
  }

  async findAll(category?: string, search?: string) {
    const where: any = {};

    if (category && category !== 'Todas') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async findFeatured() {
    return this.prisma.event.findMany({
      where: { featured: true },
      orderBy: { date: 'asc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Evento no encontrado');
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const dataToUpdate: any = { ...updateEventDto };
    if (updateEventDto.date) {
      dataToUpdate.date = new Date(updateEventDto.date);
    }

    try {
      return await this.prisma.event.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Evento no encontrado');
      throw e;
    }
  }

  async toggleFeatured(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new BadRequestException('Evento no encontrado');

    return this.prisma.event.update({
      where: { id },
      data: { featured: !event.featured },
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.event.delete({ where: { id } });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Evento no encontrado');
      throw e;
    }
  }
}
