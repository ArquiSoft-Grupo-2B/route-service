import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthServiceGuard } from './guards/auth-service.guard';
import { AuthServiceClient } from './services/auth-service.client';
import { RouteEnrichmentService } from './services/route-enrichment.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [AuthServiceGuard, AuthServiceClient, RouteEnrichmentService],
  exports: [AuthServiceGuard, AuthServiceClient, RouteEnrichmentService],
})
export class CommonModule {}
