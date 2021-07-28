import { Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { MessageBody } from '@nestjs/websockets';
import { GetGameListDto } from '../dtos/get-game-list.dto';
import { GetGameResultDto } from '../dtos/get-game-result.dto';
import { GameService } from './game.service';
import { Response } from 'express';
import { CreateGameDto } from '../dtos/create-game.dto';
import { CheckGameDto } from '../dtos/check-game.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';

@UseGuards(AuthenticatedGuard)
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // FE측은 POST로 여기로 날려주고, socket-> 'enter'로 접속해주어야 함.
  @Post('/new')
  createCustomGame(@Req() req, @Res() response: Response, @MessageBody() body: CreateGameDto) {
    response.status(HttpStatus.OK);
    response.send(this.gameService.createCustomGame(req.user.id, body));
  }

  // TODO
  @Post('/valid')
  checkGameValidate(@Res() response: Response, @MessageBody() body: CheckGameDto) {
    const result: number = this.gameService.checkGameValidate(body);
    response.status(result).send();
  }

  // TODO
  // 유저가 방을 만들거나 게임에 참여하려할 때, 이미 참여하고 있는 게임이 있는지 확인
  @Get('/valid/user/')
  checkUserAlreadyInGame(@Res() response: Response, @Req() req) {
    const result: number = this.gameService.checkUserAlreadyInGame(req.user.id);
    response.status(result).send();
  }

  @Get('/list')
  getAllList(@Res() response: Response) {
    const list: GetGameListDto[] = this.gameService.getAllList();
    response.status(HttpStatus.OK).send(list);
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
  getAll(@Param('username') username: string): Promise<GetGameResultDto[]> {
    return this.gameService.findByUsername(username);
  }
}
