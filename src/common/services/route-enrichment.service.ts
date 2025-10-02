import { Injectable, Logger } from '@nestjs/common';
import { Route } from '../../routes/domain/entities/route.entity';
import { AuthServiceClient } from './auth-service.client';
import { UserType } from '../interfaces/auth-service.interface';

export interface RouteWithCreatorInfo extends Route {
  creator?: UserType | null;
}

@Injectable()
export class RouteEnrichmentService {
  private readonly logger = new Logger(RouteEnrichmentService.name);

  constructor(private readonly authServiceClient: AuthServiceClient) {}

  /**
   * Enriquece una sola ruta con información del creador
   */
  async enrichRouteWithCreator(route: Route): Promise<RouteWithCreatorInfo> {
    try {
      if (!route.creator_id) {
        this.logger.warn(`Ruta ${route.id} no tiene creator_id definido`);
        return { ...route, creator: null };
      }

      const creator = await this.authServiceClient.getUserById(route.creator_id);
      
      if (!creator) {
        this.logger.warn(`Creador no encontrado para ruta ${route.id}, creator_id: ${route.creator_id}`);
      }

      return {
        ...route,
        creator: creator,
      };
    } catch (error) {
      this.logger.error(`Error al enriquecer ruta ${route.id} con información del creador:`, error);
      // En caso de error, retornamos la ruta sin información del creador
      return { ...route, creator: null };
    }
  }

  /**
   * Enriquece múltiples rutas con información de sus creadores
   */
  async enrichRoutesWithCreators(routes: Route[]): Promise<RouteWithCreatorInfo[]> {
    const enrichmentPromises = routes.map(route => this.enrichRouteWithCreator(route));
    
    try {
      // Ejecutar todas las consultas en paralelo para mejor rendimiento
      const enrichedRoutes = await Promise.all(enrichmentPromises);
      return enrichedRoutes;
    } catch (error) {
      this.logger.error('Error al enriquecer múltiples rutas con información de creadores:', error);
      // En caso de error general, retornamos las rutas sin información de creadores
      return routes.map(route => ({ ...route, creator: null }));
    }
  }

  /**
   * Obtiene información resumida del creador (solo información pública)
   */
  async getCreatorSummary(creatorId: string): Promise<{ id: string; alias: string; email?: string } | null> {
    try {
      const creator = await this.authServiceClient.getUserById(creatorId);
      
      if (!creator) {
        return null;
      }

      // Retornar solo información pública del usuario
      return {
        id: creator.id,
        alias: creator.alias || 'Usuario sin alias',
        // El email solo se incluye si es necesario para la UI
        email: creator.email?.split('@')[0] + '@***', // Email parcialmente oculto
      };
    } catch (error) {
      this.logger.error(`Error al obtener resumen del creador ${creatorId}:`, error);
      return null;
    }
  }

  /**
   * Verifica si un usuario puede ver información detallada de una ruta
   * (por ejemplo, si es el creador o si la ruta es pública)
   */
  async canUserViewRoute(route: Route, userId: string): Promise<boolean> {
    // El creador siempre puede ver su propia ruta
    if (route.creator_id === userId) {
      return true;
    }

    // Aquí se pueden agregar más reglas de negocio:
    // - Rutas públicas vs privadas
    // - Rutas compartidas
    // - Permisos especiales
    
    // Por ahora, todas las rutas son visibles para todos los usuarios autenticados
    return true;
  }

  /**
   * Valida que el usuario tenga permisos para modificar una ruta
   */
  async canUserModifyRoute(route: Route, userId: string): Promise<boolean> {
    // Solo el creador puede modificar la ruta
    if (route.creator_id === userId) {
      return true;
    }

    // Aquí se pueden agregar más reglas:
    // - Administradores
    // - Colaboradores de la ruta
    // - etc.

    return false;
  }
}