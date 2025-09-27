import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import type { RouteRepository } from '../../routes/domain/repositories/route.repository';
import { ROUTE_REPOSITORY_TOKEN } from '../../routes/domain/repositories/route.repository.token';

@Injectable()
export class RouteOwnerGuard implements CanActivate {
  constructor(
    @Inject(ROUTE_REPOSITORY_TOKEN)
    private readonly routeRepository: RouteRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Verificar que el usuario esté autenticado (debe ejecutarse después de AuthServiceGuard)
    if (!request.user || !request.user.uid) {
      throw new BadRequestException('Usuario no autenticado. Aplique AuthServiceGuard primero');
    }

    // Obtener el ID de la ruta desde los parámetros
    const routeId = request.params.id;
    if (!routeId) {
      throw new BadRequestException('ID de ruta requerido en los parámetros');
    }

    try {
      // Buscar la ruta en el repositorio
      const route = await this.routeRepository.findById(routeId);
      
      if (!route) {
        throw new NotFoundException(`Ruta con ID ${routeId} no encontrada`);
      }

      // Verificar que el usuario sea el propietario de la ruta
      if (route.creator_id !== request.user.uid) {
        throw new ForbiddenException('No tienes permisos para acceder a esta ruta');
      }

      return true;
    } catch (error) {
      // Re-lanzar errores conocidos
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException || 
          error instanceof BadRequestException) {
        throw error;
      }
      
      // Error inesperado del repositorio
      throw new BadRequestException('Error al verificar propiedad de la ruta: ' + error.message);
    }
  }
}
