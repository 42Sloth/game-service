import { Module } from '@nestjs/common';

import { PongGateway } from './modules/pong/pong.gateway';
import { PongModule } from './modules/pong/pong.module';
import { PongService } from './modules/pong/pong.service';

@Module({
  imports: [PongModule],
  // providers: [ChatGateway, PongGateway],
  // providers: [PongGateway, PongService],
})
export class AppModule {}
