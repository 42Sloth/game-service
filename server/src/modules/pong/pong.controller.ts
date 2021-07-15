import { Controller, Get } from '@nestjs/common';
import { listen } from 'socket.io';
import { PongListResponseDto } from '../dtos/PongListResponseDto';
import { userToRoom, roomToGame, IroomToGame,  matchQueue } from './pong.gateway';

@Controller('pong')
export class PongController {

	@Get('/list')
	getAllList(): PongListResponseDto[]{
		const list: PongListResponseDto[] = [];
		for(let key of Object.keys(roomToGame)) {
			const ele: PongListResponseDto = new PongListResponseDto(key, roomToGame[key].players[0].username, roomToGame[key].players[1].username);
			list.push(ele);
		}
		return list;
	}
}
