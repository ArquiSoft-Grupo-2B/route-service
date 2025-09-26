import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type {
  RouteRepository,
  UpdateRouteData,
} from '../../domain/repositories/route.repository';
import { Route } from '../../domain/entities/route.entity';
import { ROUTE_REPOSITORY_TOKEN } from '../../domain/repositories/route.repository.token';

@Injectable()
export class UpdateRouteUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY_TOKEN)
    private readonly routeRepository: RouteRepository,
  ) {}

  async execute(id: string, data: UpdateRouteData, userId: string): Promise<Route> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID de ruta requerido');
    }

    if (!userId || userId.trim() === '') {
      throw new BadRequestException('User ID es requerido para autorización');
    }

    // Verificar que la ruta existe y obtener el creator_id
    const existingRoute = await this.routeRepository.findById(id);
    if (!existingRoute) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }

    // Verificar autorización: solo el creador puede actualizar
    if (existingRoute.creator_id !== userId) {
      throw new ForbiddenException('No tienes permisos para actualizar esta ruta');
    }

    // Validaciones de negocio para actualización
    if (data.distance_km !== undefined && data.distance_km < 0) {
      throw new BadRequestException('La distancia no puede ser negativa');
    }

    if (data.est_time_min !== undefined && data.est_time_min < 0) {
      throw new BadRequestException('El tiempo estimado no puede ser negativo');
    }

    if (
      data.avg_rating !== undefined &&
      (data.avg_rating < 0 || data.avg_rating > 5)
    ) {
      throw new BadRequestException('La calificación debe estar entre 0 y 5');
    }

    // Proceder con la actualización
    const updatedRoute = await this.routeRepository.update(id, data);

    if (!updatedRoute) {
      throw new NotFoundException(`Error al actualizar la ruta con ID ${id}`);
    }

    return updatedRoute;
  }
}
