// Nuevo servicio para integrar con C++
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LineString } from '../../domain/entities/route.entity';

export interface CalculationRequest {
  geometry: LineString;
}

export interface CalculationResponse {
  distance_km: number;
  est_time_min: number;
}

interface OsrmRouteResponse {
  code: string;
  message?: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry?: LineString;
  }>;
}

@Injectable()
export class RouteCalculationService {
  private readonly logger = new Logger(RouteCalculationService.name);
  private readonly calculationServiceUrl: string;
  private readonly profile: string;

  constructor(private configService: ConfigService) {
    const configuredUrl = this.configService.get<string>(
      'CALCULATION_SERVICE_URL',
    );
    this.logger.debug(`Ruta del servidor de OSRM : ${configuredUrl}`);
    const sanitizedUrl = configuredUrl?.trim().replace(/\/$/, '');
    this.calculationServiceUrl = sanitizedUrl || 'http://localhost:5002';

    const configuredProfile = this.configService.get<string>('OSRM_PROFILE');
    this.profile = configuredProfile?.trim() || 'walking';
  }

  /**
   * Calcula distancia y tiempo estimado usando el Servicio de Cálculo C++
   */
  async calculateRouteMetrics(
    geometry: LineString,
  ): Promise<CalculationResponse> {
    try {
      if (!geometry?.coordinates || geometry.coordinates.length < 2) {
        throw new Error(
          'Se requieren al menos dos coordenadas para calcular la ruta con OSRM',
        );
      }

      const coordinatesPath = this.buildCoordinatesPath(geometry.coordinates);
      const url = this.buildOsrmUrl('route', coordinatesPath, {
        overview: 'false',
      });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OSRM route error: ${response.status}`);
      }

      const payload = (await response.json()) as OsrmRouteResponse;

      console.log(payload);

      if (payload.code !== 'Ok' || !payload.routes?.length) {
        throw new Error(
          `OSRM no pudo calcular la ruta: ${payload.message || payload.code}`,
        );
      }

      const firstRoute = payload.routes[0];

      return {
        distance_km: firstRoute.distance / 1000,
        est_time_min: firstRoute.duration / 60,
      };
    } catch (error) {
      throw new Error(`Error al obtener métricas con OSRM: ${error.message}`);
    }
  }

  /**
   * Obtiene indicaciones desde ubicación actual hasta inicio de ruta
   */
  async getDirectionsToStart(
    fromLat: number,
    fromLng: number,
    routeGeometry: LineString,
  ): Promise<LineString> {
    try {
      // Obtener primer punto de la ruta como destino
      const startPoint = routeGeometry.coordinates[0];

      if (!startPoint) {
        throw new Error('La geometría de la ruta no contiene un punto inicial');
      }

      const coordinatesPath = this.buildCoordinatesPath([
        [fromLng, fromLat],
        [startPoint[0], startPoint[1]],
      ]);

      const url = this.buildOsrmUrl('route', coordinatesPath, {
        overview: 'full',
        geometries: 'geojson',
        steps: 'false',
      });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OSRM directions error: ${response.status}`);
      }

      const payload = (await response.json()) as OsrmRouteResponse;

      if (payload.code !== 'Ok' || !payload.routes?.length) {
        throw new Error(
          `OSRM no pudo generar indicaciones: ${payload.message || payload.code}`,
        );
      }

      const geometry = payload.routes[0].geometry;

      if (!geometry || geometry.type !== 'LineString') {
        throw new Error('OSRM no retornó una geometría válida (LineString)');
      }

      return geometry;
    } catch (error) {
      throw new Error(
        `Error al obtener indicaciones con OSRM: ${error.message}`,
      );
    }
  }

  private buildCoordinatesPath(coordinates: number[][]): string {
    return coordinates
      .map(([lng, lat]) => {
        if (lng === undefined || lat === undefined) {
          throw new Error('Coordenada inválida proporcionada a OSRM');
        }
        return `${lng},${lat}`;
      })
      .join(';');
  }

  private buildOsrmUrl(
    endpoint: 'route' | 'nearest' | 'table' | 'match' | 'trip' | 'tile',
    coordinatesPath: string,
    params?: Record<string, string>,
  ): string {
    const url = new URL(
      `${this.calculationServiceUrl}/${endpoint}/v1/${this.profile}/${coordinatesPath}`,
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, value);
        }
      });
    }

    return url.toString();
  }
}
