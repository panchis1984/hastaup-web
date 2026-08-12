import { IsString, IsNotEmpty, IsIn, IsUrl, IsArray, IsOptional, IsDateString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'El título del evento no puede estar vacío' })
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString({}, { message: 'La fecha del evento debe ser una fecha válida (ISO)' })
  @IsNotEmpty({ message: 'La fecha del evento es obligatoria' })
  date!: string;

  @IsString()
  @IsNotEmpty({ message: 'La hora del evento no puede estar vacía' })
  time!: string;

  @IsString()
  @IsNotEmpty({ message: 'La ubicación no puede estar vacía' })
  location!: string;

  @IsOptional()
  @IsString()
  @IsIn(['Subasta', 'Charla', 'Capacitación', 'Exhibición', 'Evento'], {
    message: 'La categoría debe ser Subasta, Charla, Capacitación, Exhibición o Evento',
  })
  category?: string;

  @IsString({ message: 'La imagen principal debe ser una cadena válida' })
  @IsNotEmpty({ message: 'La foto de portada es obligatoria' })
  imageUrl!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  links?: any[];
}
