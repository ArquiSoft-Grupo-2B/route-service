import {
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
  MaxLength,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { LineString } from '../domain/entities/route.entity';

export class CreateRouteDto {
  @ApiProperty({
    description: 'Nombre descriptivo de la ruta',
    example: 'Ruta del Parque Central',
    minLength: 1,
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'El nombre de la ruta es requerido' })
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Distancia de la ruta en kilómetros',
    example: 5.2,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La distancia debe ser un número válido' })
  @Min(0, { message: 'La distancia no puede ser negativa' })
  distance_km?: number;

  @ApiProperty({
    description: 'Tiempo estimado para completar la ruta en minutos',
    example: 45,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El tiempo estimado debe ser un número válido' })
  @Min(0, { message: 'El tiempo estimado no puede ser negativo' })
  est_time_min?: number;

  @ApiProperty({
    description: 'Geometría de la ruta en formato GeoJSON LineString',
    example: {
      type: 'LineString',
      coordinates: [
        [-74.0059, 40.7128],
        [-74.0058, 40.7129],
        [-74.0057, 40.7130]
      ]
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  geometry?: LineString;
}
