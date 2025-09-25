import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../../domain/entities/route.entity';
import {
  RouteRepository,
  CreateRouteData,
  UpdateRouteData,
} from '../../domain/repositories/route.repository';
import { CreateRouteDto } from '../../dto/create-route.dto';

@Injectable()
export class RouteRepositoryImpl implements RouteRepository {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {}

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    const newRoute = this.routeRepository.create(createRouteDto);
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
