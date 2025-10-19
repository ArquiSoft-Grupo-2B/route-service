import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../../domain/entities/route.entity';
import {
  RouteRepository,
  CreateRouteData,
  UpdateRouteData,
  FindNearbyParams,
} from '../../domain/repositories/route.repository';
import { CreateRouteDto } from '../../dto/create-route.dto';

@Injectable()
export class RouteRepositoryImpl implements RouteRepository {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {}

  async create(data: CreateRouteData): Promise<Route> {
    const newRoute = this.routeRepository.create(data);
    return await this.routeRepository.save(newRoute);
  }

  async findAll(): Promise<Route[]> {
    return await this.routeRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: string): Promise<Route | null> {
    return await this.routeRepository.findOne({ where: { id } });
  }

  async findNearby(params: FindNearbyParams): Promise<Route[]> {
    const { latitude, longitude, radius_m } = params;
    
    // Crear punto de referencia en formato WKT (Well-Known Text)
    const referencePoint = `POINT(${longitude} ${latitude})`;
    
    return await this.routeRepository
      .createQueryBuilder('route')
      .select([
        'route.id',
        'route.creator_id', 
        'route.name',
        'route.distance_km',
        'route.est_time_min',
        'route.avg_rating',
        'route.completed_count',
        'route.score',
        'route.geometry',
        'route.created_at',
        'route.updated_at'
      ])
      .addSelect(
        `ST_Distance(route.geometry, ST_GeomFromText(:referencePoint, 4326))`,
        'distance_meters'
      )
      .where(
        `ST_DWithin(route.geometry, ST_GeomFromText(:referencePoint, 4326), :radius_m)`
      )
      .setParameters({ 
        referencePoint, 
        radius_m 
      })
      .orderBy('distance_meters', 'ASC')
      .getRawAndEntities()
      .then(result => result.entities);
  }

  async update(id: string, data: UpdateRouteData): Promise<Route | null> {
    const result = await this.routeRepository.update(id, data);

    if (result.affected === 0) {
      return null;
    }

    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.routeRepository.delete(id);
    if (result.affected == null) {
      return false;
    }
    return result.affected > 0;
  }

  async findByCreator(creatorId: string): Promise<Route[]> {
    return await this.routeRepository.find({
      where: { creator_id: creatorId },
      order: { created_at: 'DESC' },
    });
  }

  async findByRatingRange(
    minRating: number,
    maxRating: number,
  ): Promise<Route[]> {
    return await this.routeRepository
      .createQueryBuilder('route')
      .where('route.avg_rating >= :minRating', { minRating })
      .andWhere('route.avg_rating <= :maxRating', { maxRating })
      .orderBy('route.avg_rating', 'DESC')
      .getMany();
  }
}
