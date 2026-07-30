import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // Ruta pública: ver propiedades destacadas
  @Get('featured')
  findFeatured() {
    return this.propertiesService.findFeatured();
  }

  // Ruta pública: listar todas las propiedades (con filtros opcionales)
  @Get()
  findAll(@Query('type') type?: string, @Query('search') search?: string) {
    return this.propertiesService.findAll(type, search);
  }

  // Ruta pública: ver detalle de una propiedad
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  // ── Rutas protegidas (solo ADMIN con JWT válido) ──

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto);
  }

  // IMPORTANTE: Esta ruta debe ir ANTES de @Patch(':id') para que NestJS no la intercepte
  @UseGuards(JwtAuthGuard)
  @Patch('destacar/:id')
  toggleFeatured(@Param('id') id: string) {
    return this.propertiesService.toggleFeatured(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }
}
