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
} from '@nestjs/common';
import { CreateRouteDto } from '../dto/create-route.dto';
import { UpdateRouteDto } from '../dto/update-route.dto';
import { FindNearbyRoutesDto } from '../dto/find-nearby-routes.dto';
import { ApiResponse } from '../../../types/ApiResponse';
import { RouteMapper } from '../infrastructure/mappers/route.mapper';

// Use Cases
import { CreateRouteUseCase } from '../application/use-cases/create-route.usecase';
import { GetRoutesUseCase } from '../application/use-cases/get-routes.usecase';
import { GetRouteByIdUseCase } from '../application/use-cases/get-route-by-id.usecase';
import { UpdateRouteUseCase } from '../application/use-cases/update-route.usecase';
import { DeleteRouteUseCase } from '../application/use-cases/delete-route.usecase';
import { GetRoutesByCreatorUseCase } from '../application/use-cases/get-routes-by-creator.usecase';
import { GetRoutesByRatingUseCase } from '../application/use-cases/get-routes-by-rating.usecase';
import { FindNearbyRoutesUseCase } from '../application/use-cases/find-nearby-routes.usecase';

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
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createRouteDto: CreateRouteDto,
    @Headers('x-user-id') userId?: string,
  ): Promise<ApiResponse> {
    try {
      // Validar que el usuario esté autenticado
      if (!userId) {
        throw new BadRequestException('Header x-user-id es requerido (Firebase UID)');
      }

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

  @Get()
  async findAll(): Promise<ApiResponse> {
    try {
      const routes = await this.getRoutesUseCase.execute();

      return {
        success: true,
        message: 'Rutas obtenidas exitosamente',
        data: RouteMapper.toResponseList(routes),
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

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRouteDto: UpdateRouteDto,
    @Headers('x-user-id') userId?: string,
  ): Promise<ApiResponse> {
    try {
      // Validar que el usuario esté autenticado
      if (!userId) {
        throw new BadRequestException('Header x-user-id es requerido para autorización');
      }

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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<ApiResponse> {
    try {
      // Validar que el usuario esté autenticado
      if (!userId) {
        throw new BadRequestException('Header x-user-id es requerido para autorización');
      }

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
}
