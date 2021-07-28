import { Server } from 'socket.io';
import { Not, Repository } from 'typeorm';
import { GetGameResultDto } from '../dtos/get-game-result.dto';
import { GameResult } from '../entity/game-result.entity';
import { Game, gameUpdate } from './game';
import { Paddle } from './submodule/paddle';
import { DIRECTION } from './submodule/enums';
import { gameData } from './submodule/game-data';
import { v4 as uuid } from 'uuid';
import { HttpStatus, NotAcceptableException } from '@nestjs/common';
import { GetGameListDto } from '../dtos/get-game-list.dto';

export class GameService {
  getAllList() {
    const list: GetGameListDto[] = [];
    for (let key of Object.keys(gameData.roomToGame)) {
      const game: Game = gameData.roomToGame[key];
      if (game.players.length === 2) {
        const ele: GetGameListDto = new GetGameListDto(
          key,
          game.players[0].username,
          game.players[1].username,
          game.type
        );
        list.push(ele);
      } else if (game.players.length === 1) {
        const ele: GetGameListDto = new GetGameListDto(key, game.players[0].username, 'waiting', game.type);
        list.push(ele);
      }
    }
    return list;
  }
  waitingInterval(server: Server, room: string, game: Game) {
    try {
      setInterval(() => {
        server.to(room).emit('drawGame', game);
      }, 1000 / 50);
    } catch (e) {
      console.log(e);
    }
  }

  startInterval(server: Server, roomId: string, game: Game) {
    try {
      const interval = setInterval(() => {
        gameUpdate(game);
        if (game.over === true) {
          server.to(roomId).emit('endGame', new GameResult(game));
          this.insertResult(game);
          delete gameData.userToRoom[game.players[0].username];
          delete gameData.userToRoom[game.players[1].username];
          delete gameData.roomToGame[roomId];
          clearInterval(interval);
        }
        server.to(roomId).emit('drawGame', game);
      }, 1000 / 50);
    } catch (e) {
      console.log(e);
    }
  }

  updatePaddle(info, game: Game) {
    if (info.type === 'up') {
      if (info.keyCode === 38) game.players[game.leftOrRight[info.username]].move = DIRECTION.IDLE;
      if (info.keyCode === 40) game.players[game.leftOrRight[info.username]].move = DIRECTION.IDLE;
    } else if (info.type === 'down') {
      if (info.keyCode === 38) game.players[game.leftOrRight[info.username]].move = DIRECTION.UP;
      if (info.keyCode === 40) game.players[game.leftOrRight[info.username]].move = DIRECTION.DOWN;
    }
  }

  createDefaultGame(username: string, access: string): string {
    if (!username) throw NotAcceptableException;
    const roomId: string = uuid();
    const game: Game = new Game();
    const paddle: Paddle = new Paddle('left', username);
    game.players.push(paddle);
    if (access === 'public') gameData.matchQueue.push(paddle);
    gameData.roomToGame[roomId] = game;
    gameData.userToRoom[username] = roomId;
    game.leftOrRight[username] = 0;
    return roomId;
  }

  createCustomGame(username: string, data): string {
    const roomId: string = this.createDefaultGame(username, data.type);
    const game: Game = gameData.roomToGame[roomId];
    game.ball.setSpeedByType(data.speed);
    game.ball.setSizeByType(data.ball);
    const colors: string[] = ['#b71540', '#ffda79', '#0a3d62', '#78e08f'];
    if (!colors.includes(data.mapColor)) game.color = '#000000';
    else game.color = data.mapColor;
    if (data.type === 'private') game.setPrivate(data.password);
    else gameData.matchQueue.push(game.players[0]);
    return roomId;
  }

  insertResult(game: Game) {
    const gameResult: GameResult = new GameResult(game);
    gameResult.save();
  }

  checkUserAlreadyInGame(username: string): number {
    if (gameData.userToRoom[username]) return HttpStatus.OK;
    return HttpStatus.NOT_ACCEPTABLE;
  }

  checkGameValidate(data): number {
    if (!data.roomId || !gameData.roomToGame[data.roomId]) return HttpStatus.BAD_REQUEST;
    const game: Game = gameData.roomToGame[data.roomId];
    if (game.type === 'private') {
      if (!data.password || data.password !== game.password) return HttpStatus.BAD_REQUEST;
    }
    if (data.mode !== 'spectEnter' && game.players.length == 2) return HttpStatus.CONFLICT;
    return HttpStatus.OK;
  }

  async countByUsername(username: string, type: number): Promise<number> {
    const gameRepository: Repository<GameResult> = GameResult.getRepository();
    let [items, count] = [null, 0];
    // type 0 : win
    if (type === 0) {
      [items, count] = await gameRepository.findAndCount({
        where: [
          { playerLeft: username, winner: username },
          { playerRight: username, winner: username },
        ],
      });
      // type 1 : lose
    } else if (type === 1) {
      [items, count] = await gameRepository.findAndCount({
        where: [
          { playerLeft: username, winner: Not(username) },
          { playerRight: username, winner: Not(username) },
        ],
      });
      // type 2 : all
    } else if (type === 2) {
      [items, count] = await gameRepository.findAndCount({
        where: [{ playerLeft: username }, { playerRight: username }],
      });
    }
    return count;
  }

  async findByUsername(username: string): Promise<GetGameResultDto[]> {
    const gameRepository: Repository<GameResult> = GameResult.getRepository();
    const items: GameResult[] = await gameRepository.find({
      where: [{ playerLeft: username }, { playerRight: username }],
      order: {
        startAt: 'DESC',
      },
    });
    const res: GetGameResultDto[] = items.map((item) => GetGameResultDto.fromEntity(item));
    return res;
  }
}
