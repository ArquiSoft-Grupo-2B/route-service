import { IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para marcar una ruta como completada por un usuario
 */
export class CompleteRouteDto {
  @ApiProperty({
    description: 'Puntuación obtenida por el usuario al completar la ruta',
    example: 85.5,
    minimum: 0,
    maximum: 100,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La puntuación debe ser un número válido' })
  @Min(0, { message: 'La puntuación no puede ser negativa' })
  @Max(100, { message: 'La puntuación no puede ser mayor a 100' })
  score?: number;

  @ApiProperty({
    description: 'Indica si la ruta fue completada exitosamente',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo completed debe ser booleano' })
  completed?: boolean;

  @ApiProperty({
    description:
      'Tiempo real que tardó el usuario en completar la ruta (en minutos)',
    example: 42,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El tiempo real debe ser un número válido' })
  @Min(0, { message: 'El tiempo real no puede ser negativo' })
  actualTimeMin?: number;
}
