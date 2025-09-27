import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthServiceClient } from '../services/auth-service.client';
import { UserType } from '../interfaces/auth-service.interface';
import { randomUUID } from 'crypto';

// Extender la interfaz Request para incluir el user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        email_verified?: boolean;
        userInfo?: UserType; // Información completa del usuario desde el auth service
      };
    }
  }
}

interface JWTPayload {
  uid: string;
  email?: string;
  email_verified?: boolean;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthServiceGuard implements CanActivate {
  private readonly logger = new Logger(AuthServiceGuard.name);
  private readonly jwtSecret: string;
  private readonly isDevelopment: boolean;

  constructor(
    private configService: ConfigService,
    private authServiceClient: AuthServiceClient,
  ) {
    const nodeEnv = (
      this.configService.get<string>('NODE_ENV') ||
      process.env.NODE_ENV ||
      ''
    ).toLowerCase();
    this.isDevelopment = nodeEnv === 'development';

    this.jwtSecret = this.configService.get('AUTH_SERVICE_JWT_SECRET') || '';
    if (!this.jwtSecret && !this.isDevelopment) {
      throw new Error('AUTH_SERVICE_JWT_SECRET must be configured');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (this.isDevelopment) {
      const devUid = randomUUID();
      const devEmail = 'test@gmail.com';

      request.user = {
        uid: devUid,
        email: devEmail,
        email_verified: true,
        userInfo: {
          id: devUid,
          email: devEmail,
          alias: 'Dev User',
        },
      };

      this.logger.warn(
        'AuthServiceGuard en modo desarrollo: asignando usuario falso y omitiendo llamadas al servicio de autenticación.',
      );
      return true;
    }
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token de autorización requerido');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Formato de token inválido. Use: Bearer <token>',
      );
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    try {
      // Verificar el JWT del Servicio de Autenticación
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;

      // Validar que el usuario existe en el Authentication Service
      const userExists = await this.authServiceClient.validateUser(decoded.uid);

      if (!userExists) {
        this.logger.warn(
          `Usuario con UID ${decoded.uid} no encontrado en Authentication Service`,
        );
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Obtener información completa del usuario desde el Authentication Service
      const userInfo = await this.authServiceClient.getUserById(decoded.uid);

      // Adjuntar información del usuario al request
      request.user = {
        uid: decoded.uid,
        email: decoded.email,
        email_verified: decoded.email_verified,
        userInfo: userInfo || undefined,
      };

      this.logger.debug(
        `Usuario autenticado: ${decoded.uid} - ${decoded.email}`,
      );
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token inválido');
      } else {
        this.logger.error('Error al verificar token:', error);
        throw new UnauthorizedException('Error al verificar autenticación');
      }
    }
  }
}
