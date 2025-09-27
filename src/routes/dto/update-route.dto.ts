import {
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { LineString } from '../domain/entities/route.entity';

export class UpdateRouteDto {
  @ApiPropertyOptional({
    description: 'Nombre descriptivo de la ruta',
    example: 'Ruta del Parque Central - Actualizada',
    minLength: 1,
    maxLength: 150,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Distancia de la ruta en kilómetros',
    example: 5.2,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La distancia debe ser un número válido' })
  @Min(0, { message: 'La distancia no puede ser negativa' })
  distance_km?: number;

  @ApiPropertyOptional({
    description: 'Tiempo estimado para completar la ruta en minutos',
    example: 45,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El tiempo estimado debe ser un número válido' })
  @Min(0, { message: 'El tiempo estimado no puede ser negativo' })
  est_time_min?: number;

  @ApiPropertyOptional({
    description: 'Geometría de la ruta en formato GeoJSON LineString',
    example: {
      type: 'LineString',
      coordinates: [
        [-74.0059, 40.7128],
        [-74.0058, 40.7129],
        [-74.0057, 40.7130]
      ]
    },
  })
  @IsOptional()
  @IsObject({ message: 'La geometría debe ser un objeto GeoJSON válido' })
  geometry?: LineString;
}
