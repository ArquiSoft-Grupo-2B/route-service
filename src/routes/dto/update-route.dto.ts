import {
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
  MaxLength,
  Min,
} from 'class-validator';
import type { LineString } from '../domain/entities/route.entity';

export class UpdateRouteDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  name?: string;

  @IsOptional()
  @IsNumber({}, { message: 'La distancia debe ser un número válido' })
  @Min(0, { message: 'La distancia no puede ser negativa' })
  distance_km?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El tiempo estimado debe ser un número válido' })
  @Min(0, { message: 'El tiempo estimado no puede ser negativo' })
  est_time_min?: number;

  @IsOptional()
  @IsObject({ message: 'La geometría debe ser un objeto GeoJSON válido' })
  geometry?: LineString;
}
