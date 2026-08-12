import { IsString, IsNotEmpty, IsNumber, IsPositive, IsIn, IsUrl, IsObject, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty({ message: 'El título no puede estar vacío' })
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'La ubicación no puede estar vacía' })
  location!: string;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @Type(() => Number)
  price!: number;

  @IsOptional()
  @IsString()
  @IsIn(['USD', 'ARS'], { message: 'La moneda debe ser "USD" o "ARS"' })
  currency?: string;

  @IsString()
  @IsIn(['Venta', 'Alquiler'], { message: 'El tipo debe ser "Venta" o "Alquiler"' })
  type!: string;

  @IsObject({ message: 'Los detalles deben ser un objeto (habitaciones, baños, etc.)' })
  details!: Record<string, any>;

  @IsString({ message: 'La imagen debe ser una cadena válida' })
  @IsNotEmpty({ message: 'La foto de portada es obligatoria' })
  imageUrl!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
