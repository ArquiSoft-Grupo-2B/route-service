import { Route } from '../entities/route.entity';

export interface CreateRouteData {
  creator_id?: string;
  name?: string;
  distance_km?: number;
  est_time_min?: number;
  avg_rating?: number;
  geometry?: any;
}

export interface UpdateRouteData {
  creator_id?: string;
  name?: string;
  distance_km?: number;
  est_time_min?: number;
  avg_rating?: number;
  geometry?: any;
}

export interface RouteRepository {
  create(data: CreateRouteData): Promise<Route>;
  findAll(): Promise<Route[]>;
  findById(id: string): Promise<Route | null>;
  update(id: string, data: UpdateRouteData): Promise<Route | null>;
  delete(id: string): Promise<boolean>;
  findByCreator(creatorId: string): Promise<Route[]>;
  findByRatingRange(minRating: number, maxRating: number): Promise<Route[]>;
}
