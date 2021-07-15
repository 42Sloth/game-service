import { Controller, Get } from '@nestjs/common';
import { userToRoom, roomToGame, IroomToGame,  matchQueue } from './pong.gateway';

@Controller('pong')
export class PongController {

	@Get('/list')
	getAllList(): string[]{
		return Object.keys(roomToGame);
	}
}
