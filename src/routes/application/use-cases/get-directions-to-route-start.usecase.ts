import { Injectable } from '@nestjs/common';
import { RouteCalculationService } from '../../infrastructure/services/route-calculation.service';
import { GetRouteByIdUseCase } from './get-route-by-id.usecase';
import type { LineString } from '../../domain/entities/route.entity';

export interface DirectionsRequest {
  routeId: string;
  fromLat: number;
  fromLng: number;
}

@Injectable()
export class GetDirectionsToRouteStartUseCase {
  constructor(
    private readonly getRouteByIdUseCase: GetRouteByIdUseCase,
    private readonly calculationService: RouteCalculationService,
  ) {}

  async execute(request: DirectionsRequest): Promise<LineString> {
    // Obtener la ruta por ID
    const route = await this.getRouteByIdUseCase.execute(request.routeId);
    
    // Calcular indicaciones desde ubicación actual hasta inicio de ruta
    return await this.calculationService.getDirectionsToStart(
      request.fromLat,
      request.fromLng,
      route.geometry
    );
  }
}