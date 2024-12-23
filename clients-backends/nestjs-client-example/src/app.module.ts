import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SamuraiDbModule } from './samurai-db/samurai-db.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env.local' }),
    SamuraiDbModule.register({
      host: 'localhost',
      port: 4001,
      maxRetries: 5,
      initialRetryInterval: 1000,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
