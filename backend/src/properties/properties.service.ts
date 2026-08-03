import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear un inmueble
  async create(createPropertyDto: CreatePropertyDto) {
    return this.prisma.property.create({
      data: createPropertyDto,
    });
  }

  // Obtener todos los inmuebles con filtros opcionales
  async findAll(type?: string, search?: string) {
    const where: any = {};

    // Si envían un tipo (Venta / Alquiler)
    if (type && type !== 'Todos') {
      where.type = type;
    }

    // Si envían una palabra de búsqueda (busca en título o ubicación)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' }, // UUIDs no son cronológicos — se ordena por fecha de creación
    });
  }

  // Obtener un inmueble por su ID — lanza 404 si no existe
  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) {
      throw new NotFoundException(`Propiedad con id "${id}" no encontrada`);
    }
    return property;
  }

  // Actualizar una propiedad existente con los campos provistos (parcial)
  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    // Verificar existencia antes de actualizar para devolver 404 limpio
    await this.findOne(id);
    return this.prisma.property.update({
      where: { id },
      data: {
        title: updatePropertyDto.title,
        location: updatePropertyDto.location,
        price: updatePropertyDto.price !== undefined ? Number(updatePropertyDto.price) : undefined,
        type: updatePropertyDto.type,
        imageUrl: updatePropertyDto.imageUrl,
        details: updatePropertyDto.details,
        // Nota: `featured` solo se modifica vía toggleFeatured para controlar el límite de 3
      },
    });
  }

  // Eliminar una propiedad — lanza 404 si no existe
  async remove(id: string) {
    await this.findOne(id); // Verificar existencia antes de eliminar
    return this.prisma.property.delete({ where: { id } });
  }

  // Obtener propiedades destacadas (hasta 3), rellena con recientes si hay menos
  async findFeatured() {
    let featured = await this.prisma.property.findMany({
      where: { featured: true },
      orderBy: { createdAt: 'desc' },
    });

    // Si hay menos de 3 destacadas, rellena con las más recientes
    if (featured.length < 3) {
      const needed = 3 - featured.length;
      const existingIds = featured.map((p) => p.id);
      const recent = await this.prisma.property.findMany({
        where: {
          id: { notIn: existingIds },
          featured: false,
        },
        orderBy: { createdAt: 'desc' },
        take: needed,
      });
      featured = [...featured, ...recent];
    }

    return featured;
  }

  // Alternar el estado de destacado (true/false) con límite de 3
  async toggleFeatured(id: string) {
    const currentlyFeaturedCount = await this.prisma.property.count({
      where: { featured: true },
    });

    const property = await this.findOne(id); // Reutiliza findOne que ya lanza 404

    if (!property.featured && currentlyFeaturedCount >= 3) {
      throw new BadRequestException('Ya hay 3 propiedades destacadas. Desmarca una primero.');
    }

    return this.prisma.property.update({
      where: { id },
      data: { featured: !property.featured },
    });
  }
}
