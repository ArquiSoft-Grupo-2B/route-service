import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

// Extender la interfaz Request para incluir el user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        email_verified?: boolean;
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
  private readonly jwtSecret: string;

  constructor(private configService: ConfigService) {
    this.jwtSecret = this.configService.get('AUTH_SERVICE_JWT_SECRET') || '';
    if (!this.jwtSecret) {
      throw new Error('AUTH_SERVICE_JWT_SECRET must be configured');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token de autorización requerido');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Formato de token inválido. Use: Bearer <token>');
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    try {
      // Verificar el JWT del Servicio de Autenticación
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
      
      // Adjuntar información del usuario al request
      request.user = {
        uid: decoded.uid,
        email: decoded.email,
        email_verified: decoded.email_verified,
      };

      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token inválido');
      } else {
        throw new UnauthorizedException('Error al verificar token: ' + error.message);
      }
    }
  }
}