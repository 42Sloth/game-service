import { Controller, Get, Param } from '@nestjs/common';
import { listen } from 'socket.io';
import { GameListResponseDto } from '../dtos/GameListResponseDto'
import { GameStatResponseDto } from '../dtos/GameStatResponseDto';
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

	@Get('/result/:username/count/win')
	getWinCount(@Param('username') username: string): Promise<number> {
		return this.gameService.countByUsername(username, 0);
	}

	@Get('/result/:username/count/lose')
	getLoseCount(@Param('username') username: string): Promise<number> {
		return this.gameService.countByUsername(username, 1);
	}

	@Get('/result/:username/count/all')
	getAllCount(@Param('username') username: string): Promise<number> {
		return this.gameService.countByUsername(username, 2);
	}

	@Get('/result/:username/all')
	getAll(@Param('username') username: string) : Promise<GameStatResponseDto[]> {
		return this.gameService.findByUsername(username);
	}

}
