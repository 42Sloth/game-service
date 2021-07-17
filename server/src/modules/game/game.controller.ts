import { Controller, Get, Param } from '@nestjs/common';
import { listen } from 'socket.io';
import { GameListResponseDto } from '../dtos/GameListResponseDto';
import { userToRoom, roomToGame, IroomToGame,  matchQueue } from './game.gateway';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
	constructor(private readonly gameService: GameService) {}

	@Get('/list')
	getAllList(): GameListResponseDto[]{
		const list: GameListResponseDto[] = [];
		for(let key of Object.keys(roomToGame)) {
			const ele: GameListResponseDto = new GameListResponseDto(key, roomToGame[key].players[0].username, roomToGame[key].players[1].username);
			list.push(ele);
		}
		return list;
	}

	@Get('/save')
	saveGame(): void {
		this.gameService.insertResult(roomToGame[userToRoom['taehkim']]);
	}

	@Get('/:username/win')
	getWinCount(@Param('username') username: string): Promise<number> {
		return this.gameService.countByUsername(username, 0);
	}

	@Get('/:username/lose')
	getLoseCount(@Param('username') username: string): Promise<number> {
		return this.gameService.countByUsername(username, 1);
	}

	@Get('/:username/all')
	getAllCount(@Param('username') username: string): Promise<number> {
		return this.gameService.countByUsername(username, 2);
	}
}
