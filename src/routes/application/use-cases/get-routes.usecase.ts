import { Injectable, Inject } from '@nestjs/common';
import type { RouteRepository } from '../../domain/repositories/route.repository';
import { Route } from '../../domain/entities/route.entity';
import { ROUTE_REPOSITORY_TOKEN } from '../../domain/repositories/route.repository.token';
import { RouteEnrichmentService, RouteWithCreatorInfo } from '../../../common/services/route-enrichment.service';

@Injectable()
export class GetRoutesUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY_TOKEN)
    private readonly routeRepository: RouteRepository,
    private readonly routeEnrichmentService: RouteEnrichmentService,
  ) {}

  async execute(includeCreatorInfo: boolean = false): Promise<Route[] | RouteWithCreatorInfo[]> {
    const routes = await this.routeRepository.findAll();
    
    if (includeCreatorInfo) {
      return await this.routeEnrichmentService.enrichRoutesWithCreators(routes);
    }
    
    return routes;
  }
}
