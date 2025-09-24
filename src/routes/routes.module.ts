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

// Infrastructure
import { RouteRepositoryImpl } from './infrastructure/persistence/route.repository.impl';

// Presentation
import { RoutesController } from './presentation/routes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Route])],
  controllers: [RoutesController],
  providers: [
    // Use Cases
    CreateRouteUseCase,
    GetRoutesUseCase,
    GetRouteByIdUseCase,
    UpdateRouteUseCase,
    DeleteRouteUseCase,
    GetRoutesByCreatorUseCase,
    GetRoutesByRatingUseCase,
    // Repository Implementation
    {
      provide: ROUTE_REPOSITORY_TOKEN,
      useClass: RouteRepositoryImpl,
    },
  ],
  exports: [
    CreateRouteUseCase,
    GetRoutesUseCase,
    GetRouteByIdUseCase,
    UpdateRouteUseCase,
    DeleteRouteUseCase,
    GetRoutesByCreatorUseCase,
    GetRoutesByRatingUseCase,
  ],
})
export class RoutesModule {}
