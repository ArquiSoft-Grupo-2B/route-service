import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  HttpStatus,
  HttpCode,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse as SwaggerResponse, 
  ApiParam,
  ApiBearerAuth,
  ApiHeader,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { CreateRouteDto } from '../dto/create-route.dto';
import { UpdateRouteDto } from '../dto/update-route.dto';
import { FindNearbyRoutesDto } from '../dto/find-nearby-routes.dto';
import { DirectionsQueryDto } from '../dto/directions-query.dto';
import { ApiResponse } from '../../../types/ApiResponse';
import { RouteMapper } from '../infrastructure/mappers/route.mapper';
import { AuthServiceGuard } from '../../common/guards/auth-service.guard';
import { RouteOwnerGuard } from '../../common/guards/route-owner.guard';

// Use Cases
import { CreateRouteUseCase } from '../application/use-cases/create-route.usecase';
import { GetRoutesUseCase } from '../application/use-cases/get-routes.usecase';
import { GetRouteByIdUseCase } from '../application/use-cases/get-route-by-id.usecase';
import { UpdateRouteUseCase } from '../application/use-cases/update-route.usecase';
import { DeleteRouteUseCase } from '../application/use-cases/delete-route.usecase';
import { GetRoutesByCreatorUseCase } from '../application/use-cases/get-routes-by-creator.usecase';
import { GetRoutesByRatingUseCase } from '../application/use-cases/get-routes-by-rating.usecase';
import { FindNearbyRoutesUseCase } from '../application/use-cases/find-nearby-routes.usecase';
import { GetDirectionsToRouteStartUseCase } from '../application/use-cases/get-directions-to-route-start.usecase';

@ApiTags('routes')
@Controller('routes')
export class RoutesController {
  constructor(
    private readonly createRouteUseCase: CreateRouteUseCase,
    private readonly getRoutesUseCase: GetRoutesUseCase,
    private readonly getRouteByIdUseCase: GetRouteByIdUseCase,
    private readonly updateRouteUseCase: UpdateRouteUseCase,
    private readonly deleteRouteUseCase: DeleteRouteUseCase,
    private readonly getRoutesByCreatorUseCase: GetRoutesByCreatorUseCase,
    private readonly getRoutesByRatingUseCase: GetRoutesByRatingUseCase,
    private readonly findNearbyRoutesUseCase: FindNearbyRoutesUseCase,
    private readonly getDirectionsToRouteStartUseCase: GetDirectionsToRouteStartUseCase,
  ) {}

  @ApiOperation({
    summary: 'Crear nueva ruta',
    description: 'Crea una nueva ruta geoespacial. Requiere autenticación con Firebase.',
  })
  @ApiCreatedResponse({
    description: 'Ruta creada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Ruta creada exitosamente',
        data: {
          id: 'uuid-123',
          creator_id: 'firebase-uid-123',
          name: 'Ruta del Parque Central',
          distance_km: 5.2,
          est_time_min: 45,
          avg_rating: null,
          geometry: { type: 'LineString', coordinates: [] },
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        statusCode: 201
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos o falta header de usuario' })
  @ApiUnauthorizedResponse({ description: 'Token de autenticación inválido o faltante' })
  @ApiBearerAuth('auth-service-jwt')
  @UseGuards(AuthServiceGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createRouteDto: CreateRouteDto,
    @Request() request: any,
  ): Promise<ApiResponse> {
    try {
      const userId = request.user.uid;

      const routeData = RouteMapper.fromCreateDtoToDomain(createRouteDto);
      const route = await this.createRouteUseCase.execute(routeData, userId);

      return {
        success: true,
        message: 'Ruta creada exitosamente',
        data: RouteMapper.toResponse(route),
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: error.status || HttpStatus.BAD_REQUEST,
      };
    }
  }

  @ApiOperation({
    summary: 'Obtener todas las rutas',
    description: 'Obtiene la lista completa de rutas. Opcionalmente incluye información del creador.',
  })
  @ApiOkResponse({
    description: 'Rutas obtenidas exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Rutas obtenidas exitosamente',
        data: [
          {
            id: 'uuid-123',
            creator_id: 'firebase-uid-123',
            name: 'Ruta del Parque Central',
            distance_km: 5.2,
            est_time_min: 45,
            avg_rating: 4.5,
            creator: {
              id: 'firebase-uid-123',
              alias: 'JohnRunner',
              email: 'john@***'
            }
          }
        ],
        statusCode: 200
      }
    }
  })
  @Get()
  async findAll(
    @Query('includeCreator') includeCreator?: string,
  ): Promise<ApiResponse> {
    try {
      const shouldIncludeCreator = includeCreator === 'true';
      const routes = await this.getRoutesUseCase.execute(shouldIncludeCreator);

      return {
        success: true,
        message: shouldIncludeCreator 
          ? 'Rutas con información de creadores obtenidas exitosamente'
          : 'Rutas obtenidas exitosamente',
        data: RouteMapper.toResponseList(routes as any), // Cast temporal para el mapper
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Get('creator/:creatorId')
  async findByCreator(
    @Param('creatorId') creatorId: string,
  ): Promise<ApiResponse> {
    try {
      const routes = await this.getRoutesByCreatorUseCase.execute(creatorId);

      return {
        success: true,
        message: 'Rutas del creador obtenidas exitosamente',
        data: RouteMapper.toResponseList(routes),
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get('rating')
  async findByRating(
    @Query('min') minRating: string,
    @Query('max') maxRating: string,
  ): Promise<ApiResponse> {
    try {
      const min = parseFloat(minRating) || 0;
      const max = parseFloat(maxRating) || 5;

      const routes = await this.getRoutesByRatingUseCase.execute(min, max);

      return {
        success: true,
        message: 'Rutas filtradas por calificación obtenidas exitosamente',
        data: RouteMapper.toResponseList(routes),
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get('near')
  async findNearbyRoutes(
    @Query() findNearbyDto: FindNearbyRoutesDto,
  ): Promise<ApiResponse> {
    try {
      // Transformar DTO a parámetros del dominio
      const params = {
        latitude: findNearbyDto.lat,
        longitude: findNearbyDto.lng,
        radius_m: findNearbyDto.radius_m || 5000,
      };

      const routes = await this.findNearbyRoutesUseCase.execute(params);

      return {
        success: true,
        message: `Se encontraron ${routes.length} rutas cercanas en un radio de ${params.radius_m} metros`,
        data: RouteMapper.toResponseList(routes),
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse> {
    try {
      const route = await this.getRouteByIdUseCase.execute(id);

      return {
        success: true,
        message: 'Ruta obtenida exitosamente',
        data: RouteMapper.toResponse(route),
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @ApiBearerAuth('auth-service-jwt')
  @UseGuards(AuthServiceGuard, RouteOwnerGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRouteDto: UpdateRouteDto,
    @Request() request: any,
  ): Promise<ApiResponse> {
    try {
      const userId = request.user.uid;

      const routeData = RouteMapper.fromUpdateDtoToDomain(updateRouteDto);
      const route = await this.updateRouteUseCase.execute(id, routeData, userId);

      return {
        success: true,
        message: 'Ruta actualizada exitosamente',
        data: RouteMapper.toResponse(route),
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @ApiBearerAuth('auth-service-jwt')
  @UseGuards(AuthServiceGuard, RouteOwnerGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Request() request: any,
  ): Promise<ApiResponse> {
    try {
      const userId = request.user.uid;

      await this.deleteRouteUseCase.execute(id, userId);

      return {
        success: true,
        message: 'Ruta eliminada exitosamente',
        statusCode: HttpStatus.NO_CONTENT,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @ApiOperation({
    summary: 'Obtener indicaciones hacia el inicio de una ruta',
    description: 'Calcula la ruta peatonal desde la ubicación actual hasta el punto de inicio de una ruta específica usando el Servicio de Cálculo C++.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la ruta',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiOkResponse({
    description: 'Indicaciones calculadas exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Indicaciones calculadas exitosamente',
        data: {
          type: 'LineString',
          coordinates: [
            [-74.0817, 4.6097],
            [-74.0820, 4.6100],
            [-74.0825, 4.6105]
          ]
        },
        statusCode: 200
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Parámetros inválidos' })
  @ApiNotFoundResponse({ description: 'Ruta no encontrada' })
  @Get(':id/directions')
  async getDirectionsToStart(
    @Param('id') routeId: string,
    @Query() query: DirectionsQueryDto,
  ): Promise<ApiResponse> {
    try {
      const directions = await this.getDirectionsToRouteStartUseCase.execute({
        routeId,
        fromLat: query.fromLat,
        fromLng: query.fromLng,
      });

      return {
        success: true,
        message: 'Indicaciones calculadas exitosamente',
        data: directions,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: error.status || HttpStatus.BAD_REQUEST,
      };
    }
  }
}
