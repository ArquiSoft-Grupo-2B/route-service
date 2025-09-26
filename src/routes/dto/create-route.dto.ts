import {
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
  MaxLength,
  IsNotEmpty,
  Min,
} from 'class-validator';
import type { LineString } from '../domain/entities/route.entity';

export class CreateRouteDto {
  @IsNotEmpty({ message: 'El nombre de la ruta es requerido' })
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  name: string;

  @IsOptional()
  @IsNumber({}, { message: 'La distancia debe ser un número válido' })
  @Min(0, { message: 'La distancia no puede ser negativa' })
  distance_km?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El tiempo estimado debe ser un número válido' })
  @Min(0, { message: 'El tiempo estimado no puede ser negativo' })
  est_time_min?: number;

  @IsOptional()
  @IsObject()
  geometry?: LineString;
}
