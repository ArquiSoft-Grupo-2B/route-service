import {
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
  MaxLength,
} from 'class-validator';
import type { Point } from 'geojson';

export class CreateRouteDto {
  @IsOptional()
  @IsString()
  creator_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsNumber()
  distance_km?: number;

  @IsOptional()
  @IsNumber()
  est_time_min?: number;

  @IsOptional()
  @IsNumber()
  avg_rating?: number;

  @IsOptional()
  @IsObject()
  geometry?: Point;
}
