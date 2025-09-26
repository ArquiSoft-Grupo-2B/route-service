import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import type {
  RouteRepository,
  CreateRouteData,
} from '../../domain/repositories/route.repository';
import { Route } from '../../domain/entities/route.entity';
import { ROUTE_REPOSITORY_TOKEN } from '../../domain/repositories/route.repository.token';

@Injectable()
export class CreateRouteUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY_TOKEN)
    private readonly routeRepository: RouteRepository,
  ) {}

  async execute(data: CreateRouteData, creatorId: string): Promise<Route> { 
    // Validación de autorización
    if (!creatorId || creatorId.trim() === '') {
      throw new BadRequestException('Creator ID (Firebase UID) es requerido');
    }

    if (!data.name || data.name.trim() === '') {
      throw new BadRequestException('El nombre de la ruta es requerido');
    }

    // Validaciones de negocio
    if (data.distance_km && data.distance_km < 0) {
      throw new BadRequestException('La distancia no puede ser negativa');
    }

    if (data.est_time_min && data.est_time_min < 0) {
      throw new BadRequestException('El tiempo estimado no puede ser negativo');
    }

    if (data.avg_rating && (data.avg_rating < 0 || data.avg_rating > 5)) {
      throw new BadRequestException('La calificación debe estar entre 0 y 5');
    }

    try {
      // Asignar el creator_id desde el parámetro
      const routeData: CreateRouteData = {
        ...data,
        creator_id: creatorId,
      };

      return await this.routeRepository.create(routeData);
    } catch (error) {
      throw new BadRequestException('Error al crear la ruta: ' + error.message);
    }
  }
}
