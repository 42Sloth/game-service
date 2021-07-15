import { Module } from '@nestjs/common';
import { PongController } from './pong.controller';
import { PongGateway } from './pong.gateway';
import { PongService } from './pong.service';

@Module({
	imports: [],
	controllers: [PongController],
	providers: [PongGateway, PongService],
})
export class PongModule {}
