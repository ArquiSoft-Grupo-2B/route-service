// Nuevo servicio para integrar con C++
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LineString } from '../../domain/entities/route.entity';

export interface CalculationRequest {
  geometry: LineString;
}

export interface CalculationResponse {
  distance_km: number;
  est_time_min: number;
}

@Injectable()
export class RouteCalculationService {
  private readonly calculationServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.calculationServiceUrl = this.configService.get('CALCULATION_SERVICE_URL') || 'http://localhost:8080';
  }

  /**
   * Calcula distancia y tiempo estimado usando el Servicio de Cálculo C++
   */
  async calculateRouteMetrics(geometry: LineString): Promise<CalculationResponse> {
    try {
      const response = await fetch(`${this.calculationServiceUrl}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ geometry }),
      });

      if (!response.ok) {
        throw new Error(`Calculation service error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error communicating with calculation service: ${error.message}`);
    }
  }

  /**
   * Obtiene indicaciones desde ubicación actual hasta inicio de ruta
   */
  async getDirectionsToStart(
    fromLat: number, 
    fromLng: number, 
    routeGeometry: LineString
  ): Promise<LineString> {
    try {
      // Obtener primer punto de la ruta como destino
      const startPoint = routeGeometry.coordinates[0];
      
      const response = await fetch(`${this.calculationServiceUrl}/directions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: { lat: fromLat, lng: fromLng },
          to: { lat: startPoint[1], lng: startPoint[0] }
        }),
      });

      if (!response.ok) {
        throw new Error(`Directions service error: ${response.status}`);
      }

      const result = await response.json();
      return result.route;
    } catch (error) {
      throw new Error(`Error getting directions: ${error.message}`);
    }
  }
}