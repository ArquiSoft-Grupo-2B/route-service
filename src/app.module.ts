import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataSourceConfig } from './config/data.source';
import { RoutesModule } from './routes/routes.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? `.env.${process.env.NODE_ENV.trim()}`
          : '.env.production',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(DataSourceConfig),
    CommonModule,
    RoutesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
