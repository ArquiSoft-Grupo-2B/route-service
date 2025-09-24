import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RouteRepository } from '../repositories/route.repository';
import { CreateRouteDto } from '../dto/create-route.dto';
import { UpdateRouteDto } from '../dto/update-route.dto';
import { Route } from '../entities/route.entity';

@Injectable()
export class RouteService {
  constructor(private readonly routeRepository: RouteRepository) {}

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    try {
      // Validaciones de negocio
      if (createRouteDto.distance_km && createRouteDto.distance_km < 0) {
        throw new BadRequestException('La distancia no puede ser negativa');
      }

      if (createRouteDto.est_time_min && createRouteDto.est_time_min < 0) {
        throw new BadRequestException(
          'El tiempo estimado no puede ser negativo',
        );
      }

      if (
        createRouteDto.avg_rating &&
        (createRouteDto.avg_rating < 0 || createRouteDto.avg_rating > 5)
      ) {
        throw new BadRequestException('La calificación debe estar entre 0 y 5');
      }

      return await this.routeRepository.create(createRouteDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear la ruta');
    }
  }

  async findAll(): Promise<Route[]> {
    return await this.routeRepository.findAll();
  }

  async findOne(id: string): Promise<Route> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID de ruta requerido');
    }

    const route = await this.routeRepository.findOne(id);

    if (!route) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }

    return route;
  }

  async update(id: string, updateRouteDto: UpdateRouteDto): Promise<Route> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID de ruta requerido');
    }

    // Validaciones de negocio para actualización
    if (
      updateRouteDto.distance_km !== undefined &&
      updateRouteDto.distance_km < 0
    ) {
      throw new BadRequestException('La distancia no puede ser negativa');
    }

    if (
      updateRouteDto.est_time_min !== undefined &&
      updateRouteDto.est_time_min < 0
    ) {
      throw new BadRequestException('El tiempo estimado no puede ser negativo');
    }

    if (
      updateRouteDto.avg_rating !== undefined &&
      (updateRouteDto.avg_rating < 0 || updateRouteDto.avg_rating > 5)
    ) {
      throw new BadRequestException('La calificación debe estar entre 0 y 5');
    }

    const updatedRoute = await this.routeRepository.update(id, updateRouteDto);

    if (!updatedRoute) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }

    return updatedRoute;
  }

  async remove(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID de ruta requerido');
    }

    const deleted = await this.routeRepository.remove(id);

    if (!deleted) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }
  }

  async findByCreator(creatorId: string): Promise<Route[]> {
    if (!creatorId || creatorId.trim() === '') {
      throw new BadRequestException('ID del creador requerido');
    }

    return await this.routeRepository.findByCreator(creatorId);
  }

  async findByRatingRange(
    minRating: number,
    maxRating: number,
  ): Promise<Route[]> {
    if (minRating < 0 || maxRating > 5 || minRating > maxRating) {
      throw new BadRequestException('Rango de calificación inválido');
    }

    return await this.routeRepository.findByRatingRange(minRating, maxRating);
  }
}
