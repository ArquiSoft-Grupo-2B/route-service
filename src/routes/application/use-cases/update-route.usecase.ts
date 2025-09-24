import {
  Injectable,
  NotFoundException,
  BadRequestException,
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

  async execute(id: string, data: UpdateRouteData): Promise<Route> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID de ruta requerido');
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

    const updatedRoute = await this.routeRepository.update(id, data);

    if (!updatedRoute) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }

    return updatedRoute;
  }
}
