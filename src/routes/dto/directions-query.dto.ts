import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsLatitude, IsLongitude } from 'class-validator';
import { Transform } from 'class-transformer';

export class DirectionsQueryDto {
  @ApiProperty({
    description: 'Latitud de la ubicación actual del usuario',
    example: 4.6097,
    minimum: -90,
    maximum: 90,
  })
  @IsNotEmpty({ message: 'La latitud es requerida' })
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @IsLatitude({ message: 'La latitud debe ser válida (-90 a 90)' })
  @Transform(({ value }) => parseFloat(value))
  fromLat: number;

  @ApiProperty({
    description: 'Longitud de la ubicación actual del usuario',
    example: -74.0817,
    minimum: -180,
    maximum: 180,
  })
  @IsNotEmpty({ message: 'La longitud es requerida' })
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @IsLongitude({ message: 'La longitud debe ser válida (-180 a 180)' })
  @Transform(({ value }) => parseFloat(value))
  fromLng: number;
}