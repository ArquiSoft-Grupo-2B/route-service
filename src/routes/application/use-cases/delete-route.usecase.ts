import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
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

  async execute(id: string, userId: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID de ruta requerido');
    }

    if (!userId || userId.trim() === '') {
      throw new BadRequestException('User ID es requerido para autorización');
    }

    // Verificar que la ruta existe y obtener el creator_id
    const existingRoute = await this.routeRepository.findById(id);
    if (!existingRoute) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }

    // Verificar autorización: solo el creador puede eliminar
    if (existingRoute.creator_id !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar esta ruta');
    }

    // Proceder con la eliminación
    const deleted = await this.routeRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException(`Error al eliminar la ruta con ID ${id}`);
    }
  }
}
