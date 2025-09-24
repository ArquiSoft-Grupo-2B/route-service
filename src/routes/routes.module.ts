import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteService } from './services/route.service';
import { RouteController } from './controllers/route.controller';
import { RouteRepository } from './repositories/route.repository';
import { Route } from './entities/route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Route])],
  controllers: [RouteController],
  providers: [RouteService, RouteRepository],
  exports: [RouteService, RouteRepository],
})
export class RoutesModule {}
