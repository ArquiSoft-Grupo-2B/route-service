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

export class FindNearbyRoutesDto {
  /**
   * Latitud del punto de referencia
   * Debe estar entre -90 y 90 grados
   */
  @IsNotEmpty({ message: 'La latitud es requerida' })
  @IsLatitude({ message: 'La latitud debe ser válida (entre -90 y 90)' })
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value))
  lat: number;

  /**
   * Longitud del punto de referencia
   * Debe estar entre -180 y 180 grados
   */
  @IsNotEmpty({ message: 'La longitud es requerida' })
  @IsLongitude({ message: 'La longitud debe ser válida (entre -180 y 180)' })
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value))
  lng: number;

  /**
   * Radio de búsqueda en metros
   * Mínimo 10 metros, máximo 100,000 metros (100km)
   */
  @IsOptional()
  @IsNumber({}, { message: 'El radio debe ser un número válido' })
  @Min(10, { message: 'El radio mínimo es 10 metros' })
  @Max(100000, { message: 'El radio máximo es 100,000 metros (100km)' })
  @Type(() => Number)
  @Transform(({ value }) => value ? parseFloat(value) : 5000)
  radius_m?: number = 5000; // Valor por defecto: 5km
}