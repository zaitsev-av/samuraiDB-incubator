import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SamuraiDbModule } from './samurai-db/samurai-db.module';

@Module({
  imports: [SamuraiDbModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
