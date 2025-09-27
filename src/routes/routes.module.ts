import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain
import { Route } from './domain/entities/route.entity';
import { ROUTE_REPOSITORY_TOKEN } from './domain/repositories/route.repository.token';

// Application
import { CreateRouteUseCase } from './application/use-cases/create-route.usecase';
import { GetRoutesUseCase } from './application/use-cases/get-routes.usecase';
import { GetRouteByIdUseCase } from './application/use-cases/get-route-by-id.usecase';
import { UpdateRouteUseCase } from './application/use-cases/update-route.usecase';
import { DeleteRouteUseCase } from './application/use-cases/delete-route.usecase';
import { GetRoutesByCreatorUseCase } from './application/use-cases/get-routes-by-creator.usecase';
import { GetRoutesByRatingUseCase } from './application/use-cases/get-routes-by-rating.usecase';
import { FindNearbyRoutesUseCase } from './application/use-cases/find-nearby-routes.usecase';
import { GetDirectionsToRouteStartUseCase } from './application/use-cases/get-directions-to-route-start.usecase';

// Infrastructure
import { RouteRepositoryImpl } from './infrastructure/persistence/route.repository.impl';
import { RouteCalculationService } from './infrastructure/services/route-calculation.service';

// Presentation
import { RoutesController } from './presentation/routes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Route])],
  controllers: [RoutesController],
  providers: [
    {
      provide: ROUTE_REPOSITORY_TOKEN,
      useClass: RouteRepositoryImpl,
    },
    RouteCalculationService,
    CreateRouteUseCase,
    GetRoutesUseCase,
    GetRouteByIdUseCase,
    UpdateRouteUseCase,
    DeleteRouteUseCase,
    GetRoutesByCreatorUseCase,
    GetRoutesByRatingUseCase,
    FindNearbyRoutesUseCase,
    GetDirectionsToRouteStartUseCase,
  ],
  exports: [
    CreateRouteUseCase,
    GetRoutesUseCase,
    GetRouteByIdUseCase,
    UpdateRouteUseCase,
    DeleteRouteUseCase,
    GetRoutesByCreatorUseCase,
    GetRoutesByRatingUseCase,
    FindNearbyRoutesUseCase,
    GetDirectionsToRouteStartUseCase,
  ],
})
export class RoutesModule {}
