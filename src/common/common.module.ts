import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthServiceGuard } from './guards/auth-service.guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [AuthServiceGuard],
  exports: [AuthServiceGuard],
})
export class CommonModule {}