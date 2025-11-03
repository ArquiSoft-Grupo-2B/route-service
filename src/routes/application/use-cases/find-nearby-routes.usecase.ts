import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import type { 
  RouteRepository,
  FindNearbyParams 
} from '../../domain/repositories/route.repository';
import { Route } from '../../domain/entities/route.entity';
import { ROUTE_REPOSITORY_TOKEN } from '../../domain/repositories/route.repository.token';

@Injectable()
export class FindNearbyRoutesUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY_TOKEN)
    private readonly routeRepository: RouteRepository,
  ) {}

  /**
   * Encuentra rutas cercanas a una ubicación específica
   * @param params - Parámetros de búsqueda que incluyen latitud, longitud y radio
   * @returns Promise<Route[]> - Lista de rutas ordenadas por distancia (más cercanas primero)
   */
  async execute(params: FindNearbyParams): Promise<Route[]> {
    // Validaciones de negocio
    if (!params.latitude || !params.longitude) {
      throw new BadRequestException('Latitud y longitud son requeridas');
    }

    if (params.latitude < -90 || params.latitude > 90) {
      throw new BadRequestException('La latitud debe estar entre -90 y 90 grados');
    }

    if (params.longitude < -180 || params.longitude > 180) {
      throw new BadRequestException('La longitud debe estar entre -180 y 180 grados');
    }

    if (params.radius_m <= 0) {
      throw new BadRequestException('El radio debe ser mayor a 0 metros');
    }

    if (params.radius_m > 100000) { // Máximo 100km
      throw new BadRequestException('El radio no puede exceder 100,000 metros (100km)');
    }

    try {
      return await this.routeRepository.findNearby(params);
    } catch (error) {
      throw new BadRequestException('Error al buscar rutas cercanas: ' + error.message);
    }
  }
}