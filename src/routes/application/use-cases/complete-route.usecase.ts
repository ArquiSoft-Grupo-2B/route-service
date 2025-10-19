import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import type { RouteRepository } from '../../domain/repositories/route.repository';
import { ROUTE_REPOSITORY_TOKEN } from '../../domain/repositories/route.repository.token';
import type {
  RouteCompletedEvent,
  EventPublisher,
} from '../../domain/events/route-completed.event';

/**
 * Parámetros para completar una ruta
 */
export interface CompleteRouteParams {
  routeId: string;
  userId: string;
  score?: number;
  completed?: boolean;
  actualTimeMin?: number;
}

/**
 * Caso de uso: Completar una ruta y publicar evento
 *
 * Este caso de uso maneja la lógica de negocio cuando un usuario
 * completa una ruta. Valida que la ruta existe y publica un evento
 * al sistema de mensajería para que otros servicios puedan reaccionar.
 */
@Injectable()
export class CompleteRouteUseCase {
  private readonly logger = new Logger(CompleteRouteUseCase.name);

  constructor(
    @Inject(ROUTE_REPOSITORY_TOKEN)
    private readonly routeRepository: RouteRepository,
    @Inject('EVENT_PUBLISHER')
    private readonly eventPublisher: EventPublisher,
  ) {}

  /**
   * Ejecuta el caso de uso de completar ruta
   * @param params - Parámetros de completación de ruta
   * @returns El evento publicado
   */
  async execute(params: CompleteRouteParams): Promise<RouteCompletedEvent> {
    const { routeId, userId, score, completed, actualTimeMin } = params;

    // Validaciones de entrada
    if (!routeId || routeId.trim() === '') {
      throw new BadRequestException('El ID de la ruta es requerido');
    }

    if (!userId || userId.trim() === '') {
      throw new BadRequestException('El ID del usuario es requerido');
    }

    // Buscar la ruta en el repositorio
    const route = await this.routeRepository.findById(routeId);

    if (!route) {
      throw new NotFoundException(`Ruta con ID ${routeId} no encontrada`);
    }

    // Incrementar el contador de completados
    const updatedCompletedCount = (route.completed_count || 0) + 1;
    await this.routeRepository.update(routeId, {
      completed_count: updatedCompletedCount,
    });

    // Actualizar el objeto route con el nuevo contador
    route.completed_count = updatedCompletedCount;

    // Construir el evento de dominio
    const event: RouteCompletedEvent = {
      eventType: 'ROUTE_COMPLETED',
      routeId: route.id,
      routeName: route.name,
      creatorId: route.creator_id,
      userId: userId,
      completed: completed ?? true,
      score: route.score ?? 0, // Score de la ruta basado en distancia
      distanceKm: route.distance_km ? Number(route.distance_km) : undefined,
      estTimeMin: route.est_time_min ? Number(route.est_time_min) : undefined,
      actualTimeMin: actualTimeMin,
      timestamp: new Date().toISOString(),
    };

    this.logger.log(
      `Usuario ${userId} completó la ruta ${routeId} (${route.name}). ` +
        `Score: ${event.score}, Completadas: ${updatedCompletedCount}, Tiempo real: ${actualTimeMin || 'N/A'} min`,
    );

    // Publicar evento al sistema de mensajería
    try {
      await this.eventPublisher.publish(event);
      this.logger.debug(
        `Evento ROUTE_COMPLETED publicado para ruta ${routeId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error al publicar evento ROUTE_COMPLETED para ruta ${routeId}:`,
        error,
      );
      // Nota: Podríamos decidir si esto debería fallar la operación o no
      // Por ahora, lanzamos el error para que el usuario sepa que falló
      throw new BadRequestException(
        'La ruta fue procesada pero no se pudo notificar al sistema. ' +
          'Por favor, contacte al administrador.',
      );
    }

    return event;
  }
}
