import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CreateRouteDto } from '../dto/create-route.dto';
import { UpdateRouteDto } from '../dto/update-route.dto';
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
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRouteDto: CreateRouteDto): Promise<ApiResponse> {
    try {
      const routeData = RouteMapper.fromCreateDtoToDomain(createRouteDto);
      const route = await this.createRouteUseCase.execute(routeData);

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
        statusCode: HttpStatus.BAD_REQUEST,
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
  ): Promise<ApiResponse> {
    try {
      const routeData = RouteMapper.fromUpdateDtoToDomain(updateRouteDto);
      const route = await this.updateRouteUseCase.execute(id, routeData);

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
  async remove(@Param('id') id: string): Promise<ApiResponse> {
    try {
      await this.deleteRouteUseCase.execute(id);

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
