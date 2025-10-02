import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
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

@Injectable()
export class AuthServiceGuard implements CanActivate {
  private readonly logger = new Logger(AuthServiceGuard.name);
  private readonly isDevelopment: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly authServiceClient: AuthServiceClient,
  ) {
    const nodeEnv =
      this.configService.get<string>('NODE_ENV')?.toLowerCase() ?? 'production';

    this.isDevelopment = nodeEnv === 'development';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    // if (this.isDevelopment) {
    //   const devUid = randomUUID();
    //   const devEmail = 'test@gmail.com';

    //   request.user = {
    //     uid: devUid,
    //     email: devEmail,
    //     email_verified: true,
    //     userInfo: {
    //       id: devUid,
    //       email: devEmail,
    //       alias: 'Dev User',
    //     },
    //   };

    //   this.logger.warn(
    //     'AuthServiceGuard en modo desarrollo: asignando usuario falso y omitiendo llamadas al servicio de autenticación.',
    //   );
    //   return true;
    // }
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

    const authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL');
    if (!authServiceUrl) {
      this.logger.error('AUTH_SERVICE_URL no está configurado');
      throw new UnauthorizedException(
        'Servicio de autenticación no disponible',
      );
    }

    try {
      const verification = await this.authServiceClient.verifyToken(token);

      if (!verification) {
        throw new UnauthorizedException(
          'Token inválido o usuario no encontrado',
        );
      }

      request.user = {
        uid: verification.uid,
        email: verification.email,
        email_verified: verification.emailVerified,
        userInfo: verification.userInfo
          ? {
              id: verification.userInfo.userId ?? verification.uid,
              email: verification.email,
              alias: verification.userInfo.name,
            }
          : undefined,
      };

      this.logger.debug(
        `Usuario autenticado: ${verification.uid} - ${verification.email}`,
      );
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('Error al verificar token vía GraphQL:', error);
      throw new UnauthorizedException('Error al verificar autenticación');
    }
  }
}
