import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FindNearbyRoutesDto {
  @ApiProperty({
    description: 'Latitud del punto de referencia para búsqueda de rutas cercanas',
    example: -34.6037,
    minimum: -90,
    maximum: 90,
  })
  @IsNotEmpty({ message: 'La latitud es requerida' })
  @IsLatitude({ message: 'La latitud debe ser válida (entre -90 y 90)' })
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value))
  lat: number;

  @ApiProperty({
    description: 'Longitud del punto de referencia para búsqueda de rutas cercanas',
    example: -58.3816,
    minimum: -180,
    maximum: 180,
  })
  @IsNotEmpty({ message: 'La longitud es requerida' })
  @IsLongitude({ message: 'La longitud debe ser válida (entre -180 y 180)' })
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value))
  lng: number;

  @ApiPropertyOptional({
    description: 'Radio de búsqueda en metros',
    example: 5000,
    default: 5000,
    minimum: 10,
    maximum: 100000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El radio debe ser un número válido' })
  @Min(10, { message: 'El radio mínimo es 10 metros' })
  @Max(100000, { message: 'El radio máximo es 100,000 metros (100km)' })
  @Type(() => Number)
  @Transform(({ value }) => value ? parseFloat(value) : 5000)
  radius_m?: number = 5000;
}