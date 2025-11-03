import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Route } from '../../domain/entities/route.entity';
import type { RouteRepository } from '../../domain/repositories/route.repository';
import { ROUTE_REPOSITORY_TOKEN } from '../../domain/repositories/route.repository.token';

@Injectable()
export class GetRoutesByCreatorUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY_TOKEN)
    private readonly routeRepository: RouteRepository,
  ) {}

  async execute(creatorId: string): Promise<Route[]> {
    if (!creatorId || creatorId.trim() === '') {
      throw new BadRequestException('ID del creador requerido');
    }

    return await this.routeRepository.findByCreator(creatorId);
  }
}
