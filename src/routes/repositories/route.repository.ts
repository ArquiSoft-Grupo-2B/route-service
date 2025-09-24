import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../entities/route.entity';
import { CreateRouteDto } from '../dto/create-route.dto';
import { UpdateRouteDto } from '../dto/update-route.dto';

@Injectable()
export class RouteRepository {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {}

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    const route = this.routeRepository.create(createRouteDto);
    return await this.routeRepository.save(route);
  }

  async findAll(): Promise<Route[]> {
    return await this.routeRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Route | null> {
    return await this.routeRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateRouteDto: UpdateRouteDto,
  ): Promise<Route | null> {
    const result = await this.routeRepository.update(id, updateRouteDto);

    if (result.affected === 0) {
      return null;
    }

    return await this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
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
