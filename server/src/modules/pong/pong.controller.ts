import { Controller, Get } from '@nestjs/common';
import { listen } from 'socket.io';
import { PongListResponseDto } from '../dtos/PongListResponseDto';
import { userToRoom, roomToGame, IroomToGame,  matchQueue } from './pong.gateway';

@Controller('pong')
export class PongController {

	@Get('/list')
	getAllList(): PongListResponseDto{
		const list: PongListResponseDto = {};
		for(let key of Object.keys(roomToGame)) {
			const strs: string[] = [];
			strs.push(roomToGame[key].players[0].username);
			strs.push(roomToGame[key].players[1].username);
			list[key] = strs;
		}
		return list;
	}
}
