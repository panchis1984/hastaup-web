import { IsString, IsNotEmpty, IsNumber, IsPositive, IsIn, IsUrl, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty({ message: 'El título no puede estar vacío' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'La ubicación no puede estar vacía' })
  location!: string;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @Type(() => Number)
  price!: number;

  @IsString()
  @IsIn(['Venta', 'Alquiler'], { message: 'El tipo debe ser "Venta" o "Alquiler"' })
  type!: string;

  @IsObject({ message: 'Los detalles deben ser un objeto (habitaciones, baños, etc.)' })
  details!: Record<string, any>;

  @IsUrl({}, { message: 'La URL de la imagen no es válida' })
  imageUrl!: string;
}
