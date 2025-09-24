import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { RouteRepository } from '../../domain/repositories/route.repository';
import { ROUTE_REPOSITORY_TOKEN } from '../../domain/repositories/route.repository.token';

@Injectable()
export class DeleteRouteUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY_TOKEN)
    private readonly routeRepository: RouteRepository,
  ) {}

  async execute(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID de ruta requerido');
    }

    const deleted = await this.routeRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }
  }
}
