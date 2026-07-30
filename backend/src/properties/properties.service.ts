import { Injectable, BadRequestException } from '@nestjs/common';
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

  // Obtener todos los inmuebles
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
      orderBy: { id: 'desc' },
    });
  }

  // Obtener un inmueble por su ID
  async findOne(id: string) {
    return this.prisma.property.findUnique({
      where: { id },
    });
  }
  // Actualizar una propiedad existente con los campos provistos (parcial)
  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    return this.prisma.property.update({
      where: { id },
      data: {
        title: updatePropertyDto.title,
        location: updatePropertyDto.location,
        price: updatePropertyDto.price !== undefined ? Number(updatePropertyDto.price) : undefined,
        type: updatePropertyDto.type,
        imageUrl: updatePropertyDto.imageUrl,
        details: updatePropertyDto.details,
      },
    });
  }
  // Eliminar una propiedad
  async remove(id: string) {
    return this.prisma.property.delete({
      where: { id },
    });
  }
  async findFeatured() {
    // Intentamos buscar las que tienen featured = true
    let featured = await this.prisma.property.findMany({
      where: { featured: true },
      orderBy: { createdAt: 'desc' }, // Las más nuevas primero
    });

    // Lógica de negocio: Si hay menos de 3 destacadas, 
    // rellenamos con las últimas propiedades creadas hasta completar 3.
    if (featured.length < 3) {
      const needed = 3 - featured.length;
      const existingIds = featured.map((p) => p.id);
      const recent = await this.prisma.property.findMany({
        where: {
          id: { notIn: existingIds }, // No incluir las que ya son destacadas
          featured: false,
        },
        orderBy: { createdAt: 'desc' },
        take: needed,
      });
      featured = [...featured, ...recent];
    }

    return featured;
  }

  // NUEVO: Alternar el estado de destacado (true/false)
  async toggleFeatured(id: string) {
    const currentlyFeaturedCount = await this.prisma.property.count({
      where: { featured: true },
    });

    const property = await this.prisma.property.findUnique({ where: { id } });

    if (!property) {
      throw new BadRequestException('Propiedad no encontrada');
    }

    if (!property.featured) {
      if (currentlyFeaturedCount >= 3) {
        throw new BadRequestException('Ya hay 3 propiedades destacadas. Desmarca una primero.');
      }
    }

    // El 'return' aquí es vital para que NestJS devuelva un JSON válido al cliente
    return this.prisma.property.update({
      where: { id },
      data: { featured: !property.featured },
    });
  }
}
