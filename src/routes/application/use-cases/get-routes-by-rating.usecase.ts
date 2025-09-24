import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import type { RouteRepository } from '../../domain/repositories/route.repository';
import { Route } from '../../domain/entities/route.entity';
import { ROUTE_REPOSITORY_TOKEN } from '../../domain/repositories/route.repository.token';

@Injectable()
export class GetRoutesByRatingUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY_TOKEN)
    private readonly routeRepository: RouteRepository,
  ) {}

  async execute(minRating: number, maxRating: number): Promise<Route[]> {
    if (minRating < 0 || maxRating > 5 || minRating > maxRating) {
      throw new BadRequestException('Rango de calificación inválido');
    }

    return await this.routeRepository.findByRatingRange(minRating, maxRating);
  }
}
