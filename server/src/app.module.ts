import { Module } from '@nestjs/common';

import { PongGateway } from './modules/pong/pong.gateway';
import { PongService } from './modules/pong/pong.service';

@Module({
  imports: [],
  // providers: [ChatGateway, PongGateway],
  providers: [PongGateway, PongService],
})
export class AppModule {}
