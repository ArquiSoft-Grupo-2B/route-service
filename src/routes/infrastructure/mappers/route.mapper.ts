import { Route } from '../../domain/entities/route.entity';
import { CreateRouteDto } from '../../dto/create-route.dto';
import { UpdateRouteDto } from '../../dto/update-route.dto';
import {
  CreateRouteData,
  UpdateRouteData,
} from '../../domain/repositories/route.repository';

export class RouteMapper {
  static fromCreateDtoToDomain(dto: CreateRouteDto): CreateRouteData {
    return {
      creator_id: dto.creator_id,
      name: dto.name,
      distance_km: dto.distance_km,
      est_time_min: dto.est_time_min,
      avg_rating: dto.avg_rating,
      geometry: dto.geometry,
    };
  }

  static fromUpdateDtoToDomain(dto: UpdateRouteDto): UpdateRouteData {
    return {
      creator_id: dto.creator_id,
      name: dto.name,
      distance_km: dto.distance_km,
      est_time_min: dto.est_time_min,
      avg_rating: dto.avg_rating,
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
}
