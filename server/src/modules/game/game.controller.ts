import { Controller, Get, Param, Post } from '@nestjs/common';
import { MessageBody } from '@nestjs/websockets';
import { listen } from 'socket.io';
import { GameListResponseDto } from '../dtos/GameListResponseDto'
import { GameStatResponseDto } from '../dtos/GameStatResponseDto';
import { userToRoom, roomToGame, IroomToGame,  matchQueue } from './game.gateway';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
	constructor(private readonly gameService: GameService) {}

	// FE측은 POST로 여기로 날려주고, socket-> 'enter'로 접속해주어야 함.
	@Post('/new')
	createCustomRoom(@MessageBody() body): string {
		return this.gameService.createCustomRoom(body);
	}

	@Get('/list')
	getAllList(): GameListResponseDto[]{
		const list: GameListResponseDto[] = [];
		for(let key of Object.keys(roomToGame)) {
			const game = roomToGame[key];
			if (game.players.length === 2) {
				const ele: GameListResponseDto = new GameListResponseDto(key, game.players[0].username, game.players[1].username);
				list.push(ele);
			} else if (game.players.length === 1) {
				const ele: GameListResponseDto = new GameListResponseDto(key, game.players[0].username, 'waiting');
				list.push(ele);
			}
		}
		return list;
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
