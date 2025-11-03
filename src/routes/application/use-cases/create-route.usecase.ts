import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import type {
  RouteRepository,
  CreateRouteData,
} from '../../domain/repositories/route.repository';
import { Route } from '../../domain/entities/route.entity';
import { ROUTE_REPOSITORY_TOKEN } from '../../domain/repositories/route.repository.token';
import { RouteCalculationService } from '../../infrastructure/services/route-calculation.service';
import { ScoreCalculationService } from '../../infrastructure/services/score-calculation.service';

@Injectable()
export class CreateRouteUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY_TOKEN)
    private readonly routeRepository: RouteRepository,
    private readonly calculationService: RouteCalculationService,
    private readonly scoreCalculationService: ScoreCalculationService,
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
      // Calcular distancia y tiempo usando el Servicio de Cálculo C++
      let calculatedDistance = data.distance_km;
      let calculatedTime = data.est_time_min;

      if (data.geometry) {
        const metrics = await this.calculationService.calculateRouteMetrics(
          data.geometry,
        );
        calculatedDistance = metrics.distance_km;
        calculatedTime = metrics.est_time_min;
      }

      // Calcular score basado en la distancia
      const score =
        calculatedDistance != null && !Number.isNaN(calculatedDistance)
          ? this.scoreCalculationService.calculateScore(calculatedDistance)
          : 0;

      // Asignar el creator_id, métricas calculadas y score
      const routeData: CreateRouteData = {
        ...data,
        creator_id: creatorId,
        distance_km:
          calculatedDistance != null && !Number.isNaN(calculatedDistance)
            ? calculatedDistance
            : undefined,
        est_time_min:
          calculatedTime != null && !Number.isNaN(calculatedTime)
            ? Math.max(0, Math.round(calculatedTime))
            : data.est_time_min != null && !Number.isNaN(data.est_time_min)
              ? Math.max(0, Math.round(data.est_time_min))
              : undefined,
        completed_count: 0,
        score: score,
      };

      return await this.routeRepository.create(routeData);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al crear la ruta: ' + error.message);
    }
  }
}
