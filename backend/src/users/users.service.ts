import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // 1. Verificar si el correo ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    // 2. Verificar si el CUIT ya existe si fue proporcionado
    if (createUserDto.cuit && createUserDto.cuit.trim() !== '') {
      const existingCuit = await this.prisma.user.findUnique({
        where: { cuit: createUserDto.cuit.trim() },
      });
      if (existingCuit) {
        throw new BadRequestException('El CUIT ingresado ya se encuentra registrado en el sistema');
      }
    }

    // 3. Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 4. Guardar el usuario en la base de datos
    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        lastName: createUserDto.lastName || '',
        cuit: createUserDto.cuit ? createUserDto.cuit.trim() : null,
        email: createUserDto.email,
        password: hashedPassword,
        phone: createUserDto.phone || '',
        city: createUserDto.city || '',
        state: createUserDto.state || '',
        country: createUserDto.country || 'Argentina',
        avatarUrl: createUserDto.avatarUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNFNUU3RUIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIyMCIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0xNiA4OEMxNiA2OS4yMjIzIDMxLjIyMjMgNTQgNTAgNTRDNjguNzc3NyA1NCA4NCA2OS4yMjIzIDg0IDg4SDE2WiIgZmlsbD0iIzlDQTNBRiIvPjwvc3ZnPg==',
      },
    });

    const { password, ...result } = user;
    return {
      success: true,
      message: 'Usuario registrado con éxito',
      data: result,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Buscar los objetos completos de inmuebles favoritos y eventos guardados
    const favoriteProperties = user.favoritePropertyIds?.length
      ? await this.prisma.property.findMany({
          where: { id: { in: user.favoritePropertyIds } },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    const savedEvents = user.savedEventIds?.length
      ? await this.prisma.event.findMany({
          where: { id: { in: user.savedEventIds } },
          orderBy: { date: 'asc' },
        })
      : [];

    const { password, ...userData } = user;

    return {
      ...userData,
      favoriteProperties,
      savedEvents,
    };
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar CUIT único si se intenta cambiar
    if (updateUserDto.cuit && updateUserDto.cuit.trim() !== '' && updateUserDto.cuit.trim() !== user.cuit) {
      const existingCuit = await this.prisma.user.findUnique({
        where: { cuit: updateUserDto.cuit.trim() },
      });
      if (existingCuit && existingCuit.id !== userId) {
        throw new BadRequestException('El CUIT ingresado ya pertenece a otro usuario');
      }
    }

    // Verificar Email único si se intenta cambiar
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingEmail && existingEmail.id !== userId) {
        throw new BadRequestException('El correo electrónico ya pertenece a otro usuario');
      }
    }

    const dataToUpdate: any = {};
    if (updateUserDto.name !== undefined) dataToUpdate.name = updateUserDto.name;
    if (updateUserDto.lastName !== undefined) dataToUpdate.lastName = updateUserDto.lastName;
    if (updateUserDto.cuit !== undefined) dataToUpdate.cuit = updateUserDto.cuit ? updateUserDto.cuit.trim() : null;
    if (updateUserDto.email !== undefined) dataToUpdate.email = updateUserDto.email;
    if (updateUserDto.phone !== undefined) dataToUpdate.phone = updateUserDto.phone;
    if (updateUserDto.city !== undefined) dataToUpdate.city = updateUserDto.city;
    if (updateUserDto.state !== undefined) dataToUpdate.state = updateUserDto.state;
    if (updateUserDto.country !== undefined) dataToUpdate.country = updateUserDto.country;
    if (updateUserDto.avatarUrl !== undefined) dataToUpdate.avatarUrl = updateUserDto.avatarUrl;

    if (updateUserDto.password && updateUserDto.password.trim() !== '') {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    const { password, ...result } = updatedUser;
    return {
      success: true,
      message: 'Perfil actualizado con éxito',
      data: result,
    };
  }

  async toggleFavoriteProperty(userId: string, propertyId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const currentFavorites = user.favoritePropertyIds || [];
    const exists = currentFavorites.includes(propertyId);

    const updatedFavorites = exists
      ? currentFavorites.filter((id) => id !== propertyId)
      : [...currentFavorites, propertyId];

    await this.prisma.user.update({
      where: { id: userId },
      data: { favoritePropertyIds: updatedFavorites },
    });

    return {
      success: true,
      isFavorite: !exists,
      favoritePropertyIds: updatedFavorites,
    };
  }

  async toggleSavedEvent(userId: string, eventId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const currentSaved = user.savedEventIds || [];
    const exists = currentSaved.includes(eventId);

    const updatedSaved = exists
      ? currentSaved.filter((id) => id !== eventId)
      : [...currentSaved, eventId];

    await this.prisma.user.update({
      where: { id: userId },
      data: { savedEventIds: updatedSaved },
    });

    return {
      success: true,
      isSaved: !exists,
      savedEventIds: updatedSaved,
    };
  }
}