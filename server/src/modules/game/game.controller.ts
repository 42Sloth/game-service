import { Controller, Get, HttpException, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
import { MessageBody } from '@nestjs/websockets';
import { listen } from 'socket.io';
import { GameListResponseDto } from '../dtos/GameListResponseDto'
import { GameStatResponseDto } from '../dtos/GameStatResponseDto';
import { Game } from './game';
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

	@Post('checkRoomValidate')
	checkRoomEnterValidate(@MessageBody() body) {
		if (!body.roomId || !roomToGame[body.roomId])
			throw new HttpException({
				status: HttpStatus.BAD_REQUEST,
				error: 'roomId가 잘못 되었습니다.'},
				HttpStatus.BAD_REQUEST);
		const game: Game = roomToGame[body.roomId];
		if (game.access === false) {
			if (!body.password || body.password !== game.password)
				throw new HttpException({
					status: HttpStatus.BAD_REQUEST,
					error: '잘못된 패스워드 혹은 roomID 입니다.'},
					HttpStatus.BAD_REQUEST);
		}
		if (game.players.length == 2)
			throw new HttpException({
				status: HttpStatus.CONFLICT,
				error: '방이 꽉 찼습니다.'},
				HttpStatus.CONFLICT);
		throw new HttpException({
			status: HttpStatus.OK,
			error: '입장 가능하십니다.'
		}, HttpStatus.OK);
	}

	// @Post('/out')
	// exitRoom(@MessageBody() body): string {
	// 	return this.gameService.exitRoom(body);
	// }

	@Get('/list')
	getAllList(): GameListResponseDto[]{
		const list: GameListResponseDto[] = [];
		for(let key of Object.keys(roomToGame)) {
			const game = roomToGame[key];
			if (game.players.length === 2) {
				const ele: GameListResponseDto = new GameListResponseDto(key, game.players[0].username, game.players[1].username, game.access === true ? 'public': 'private');
				list.push(ele);
			} else if (game.players.length === 1) {
				const ele: GameListResponseDto = new GameListResponseDto(key, game.players[0].username, 'waiting', game.access === true ? 'public': 'private');
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
