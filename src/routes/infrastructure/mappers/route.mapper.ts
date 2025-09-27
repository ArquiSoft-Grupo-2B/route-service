import { Route, LineString } from '../../domain/entities/route.entity';
import { CreateRouteDto } from '../../dto/create-route.dto';
import { UpdateRouteDto } from '../../dto/update-route.dto';
import {
  CreateRouteData,
  UpdateRouteData,
} from '../../domain/repositories/route.repository';

export class RouteMapper {
  static fromCreateDtoToDomain(dto: CreateRouteDto): CreateRouteData {
    return {
      // creator_id se asigna en el UseCase, no desde el DTO
      name: dto.name,
      distance_km: dto.distance_km,
      est_time_min: dto.est_time_min,
      geometry: dto.geometry,
    };
  }

  static fromUpdateDtoToDomain(dto: UpdateRouteDto): UpdateRouteData {
    return {
      // creator_id no se puede cambiar en update
      // avg_rating se maneja por separado en otra funcionalidad
      name: dto.name,
      distance_km: dto.distance_km,
      est_time_min: dto.est_time_min,
      geometry: dto.geometry,
    };
  }

  static toResponse(route: Route) {
    return {
      id: route.id,
      creator_id: route.creator_id,
      name: route.name,
      distance_km: route.distance_km,
      est_time_min: route.est_time_min,
      avg_rating: route.avg_rating,
      geometry: route.geometry,
      created_at: route.created_at,
      updated_at: route.updated_at,
    };
  }

  static toResponseList(routes: Route[]) {
    return routes.map((route) => this.toResponse(route));
  }

  static toGeoJsonFeatureCollection(routes: Route[]) {
    return {
      type: 'FeatureCollection',
      features: routes.map((route) => this.toGeoJsonFeature(route)),
    };
  }

  private static toGeoJsonFeature(route: Route) {
    const geometry: LineString = route.geometry ?? {
      type: 'LineString',
      coordinates: [],
    };

    const distanceKm =
      route.distance_km != null ? Number(route.distance_km) : null;
    const estTimeMin =
      route.est_time_min != null ? Number(route.est_time_min) : null;

    return {
      type: 'Feature',
      geometry,
      properties: {
        id: route.id,
        distancia:
          distanceKm != null && !Number.isNaN(distanceKm)
            ? `${distanceKm.toFixed(1)} km`
            : undefined,
        duracion:
          estTimeMin != null && !Number.isNaN(estTimeMin)
            ? `${estTimeMin} min`
            : undefined,
        nombre: route.name,
      },
    };
  }
}
