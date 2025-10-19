import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, type Connection, type Channel } from 'amqplib';
import type { EventPublisher } from '../../domain/events/route-completed.event';

/**
 * Servicio de infraestructura para la comunicación con RabbitMQ
 * Implementa el patrón EventPublisher del dominio
 */
@Injectable()
export class RabbitMQService
  implements EventPublisher, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitMQService.name);

  private connection: any = null;
  private channel: any = null;
// 
  private readonly rabbitmqUrl: string;
  private readonly exchangeName: string;
  private readonly exchangeType: string;
  private readonly routingKey: string;

  private isConnected = false;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts: number;
  private readonly reconnectDelay: number;

  constructor(private readonly configService: ConfigService) {
    this.rabbitmqUrl =
      this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
    this.exchangeName =
      this.configService.get<string>('RABBITMQ_EXCHANGE') || 'routes_events';
    this.exchangeType =
      this.configService.get<string>('RABBITMQ_EXCHANGE_TYPE') || 'topic';
    this.routingKey =
      this.configService.get<string>('RABBITMQ_ROUTING_KEY') ||
      'route.completed';
    this.maxReconnectAttempts =
      this.configService.get<number>('RABBITMQ_MAX_RECONNECT_ATTEMPTS') || 5;
    this.reconnectDelay =
      this.configService.get<number>('RABBITMQ_RECONNECT_DELAY') || 5000;

    this.logger.debug(
      `RabbitMQ configurado - URL: ${this.rabbitmqUrl}, Exchange: ${this.exchangeName}`,
    );
  }

  /**
   * Inicializa la conexión con RabbitMQ al iniciar el módulo
   */
  async onModuleInit() {
    await this.connect();
  }

  /**
   * Cierra la conexión con RabbitMQ al destruir el módulo
   */
  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Establece conexión con RabbitMQ y configura el exchange
   */
  private async connect(): Promise<void> {
    if (this.isConnected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.logger.log(`Conectando a RabbitMQ en ${this.rabbitmqUrl}...`);

      // Crear conexión
      this.connection = await connect(this.rabbitmqUrl);

      // Manejar eventos de error y cierre de conexión
      if (this.connection) {
        this.connection.on('error', (err) => {
          this.logger.error('Error en conexión RabbitMQ:', err);
          this.isConnected = false;
        });

        this.connection.on('close', () => {
          this.logger.warn('Conexión RabbitMQ cerrada');
          this.isConnected = false;
          this.scheduleReconnect();
        });

        // Crear canal
        this.channel = await this.connection.createChannel();
      }

      // Manejar eventos del canal
      if (this.channel) {
        this.channel.on('error', (err) => {
          this.logger.error('Error en canal RabbitMQ:', err);
        });

        this.channel.on('close', () => {
          this.logger.warn('Canal RabbitMQ cerrado');
        });

        // Declarar exchange (idempotente, no falla si ya existe)
        await this.channel.assertExchange(
          this.exchangeName,
          this.exchangeType,
          {
            durable: true, // El exchange sobrevive a reinicios del broker
          },
        );
      }

      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      this.logger.log(
        `✅ Conectado exitosamente a RabbitMQ - Exchange: ${this.exchangeName}`,
      );
    } catch (error) {
      this.isConnecting = false;
      this.logger.error('Error al conectar con RabbitMQ:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Programa un intento de reconexión
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(
        `Se alcanzó el máximo de intentos de reconexión (${this.maxReconnectAttempts}). ` +
          'No se intentará reconectar automáticamente.',
      );
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    this.logger.warn(
      `Reintentando conexión a RabbitMQ en ${delay}ms ` +
        `(intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Cierra la conexión con RabbitMQ
   */
  private async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      this.isConnected = false;
      this.logger.log('Desconectado de RabbitMQ');
    } catch (error) {
      this.logger.error('Error al desconectar de RabbitMQ:', error);
    }
  }

  /**
   * Publica un evento al exchange de RabbitMQ
   * @param event - Evento a publicar
   */
  async publish<T>(event: T): Promise<void> {
    if (!this.isConnected || !this.channel) {
      const errorMsg =
        'No hay conexión activa con RabbitMQ. El evento no se pudo publicar.';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const message = JSON.stringify(event);
      const buffer = Buffer.from(message);

      // Publicar mensaje al exchange con routing key
      const published = this.channel.publish(
        this.exchangeName,
        this.routingKey,
        buffer,
        {
          persistent: true, // Mensaje persiste en disco
          contentType: 'application/json',
          timestamp: Date.now(),
        },
      );

      if (!published) {
        throw new Error('El canal está lleno, no se pudo publicar el mensaje');
      }

      this.logger.debug(
        `Evento publicado a RabbitMQ - Exchange: ${this.exchangeName}, ` +
          `Routing Key: ${this.routingKey}, Payload: ${message}`,
      );
    } catch (error) {
      this.logger.error('Error al publicar evento a RabbitMQ:', error);
      throw error;
    }
  }

  /**
   * Verifica si el servicio está conectado a RabbitMQ
   */
  isHealthy(): boolean {
    return this.isConnected && this.channel !== null;
  }

  /**
   * Obtiene el estado actual de la conexión
   */
  getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
    };
  }
}
