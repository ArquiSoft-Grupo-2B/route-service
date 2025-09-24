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
import { RouteService } from '../services/route.service';
import { CreateRouteDto } from '../dto/create-route.dto';
import { UpdateRouteDto } from '../dto/update-route.dto';
import { ApiResponse } from '../../../types/ApiResponse';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRouteDto: CreateRouteDto): Promise<ApiResponse> {
    try {
      const route = await this.routeService.create(createRouteDto);
      return {
        success: true,
        message: 'Ruta creada exitosamente',
        data: route,
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
      const routes = await this.routeService.findAll();
      return {
        success: true,
        message: 'Rutas obtenidas exitosamente',
        data: routes,
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
      const routes = await this.routeService.findByCreator(creatorId);
      return {
        success: true,
        message: 'Rutas del creador obtenidas exitosamente',
        data: routes,
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

      const routes = await this.routeService.findByRatingRange(min, max);
      return {
        success: true,
        message: 'Rutas filtradas por calificación obtenidas exitosamente',
        data: routes,
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
      const route = await this.routeService.findOne(id);
      return {
        success: true,
        message: 'Ruta obtenida exitosamente',
        data: route,
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
      const route = await this.routeService.update(id, updateRouteDto);
      return {
        success: true,
        message: 'Ruta actualizada exitosamente',
        data: route,
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
      await this.routeService.remove(id);
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
