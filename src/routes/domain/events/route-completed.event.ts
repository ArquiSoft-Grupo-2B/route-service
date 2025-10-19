/**
 * Enum que define los tipos de eventos del dominio de rutas
 */
export enum RouteEventType {
  ROUTE_COMPLETED = 'ROUTE_COMPLETED',
}

/**
 * Evento de dominio que representa la finalización de una ruta por un usuario
 */
export interface RouteCompletedEvent {
  /** Tipo de evento para distinguir entre diferentes tipos de eventos */
  eventType: RouteEventType;

  /** ID único de la ruta */
  routeId: string;

  /** Nombre de la ruta */
  routeName: string;

  /** ID del creador de la ruta */
  creatorId: string;

  /** ID del usuario que completó la ruta */
  userId: string;

  /** Indica si la ruta fue completada (siempre true en este evento) */
  completed: boolean;

  /** Puntuación obtenida por completar la ruta (basada en distancia) */
  score: number;

  /** Distancia de la ruta en kilómetros (opcional) */
  distanceKm?: number;

  /** Tiempo estimado en minutos (opcional) */
  estTimeMin?: number;

  /** Tiempo real que tardó el usuario en completar la ruta (opcional) */
  actualTimeMin?: number;

  /** Fecha y hora de finalización en formato ISO 8601 */
  timestamp: string;
}

/**
 * Interfaz base para publicadores de eventos
 */
export interface EventPublisher {
  /**
   * Publica un evento al sistema de mensajería
   * @param event - Evento a publicar
   */
  publish<T>(event: T): Promise<void>;
}
