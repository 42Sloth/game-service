import { Server } from 'socket.io';
import { Not, Repository } from 'typeorm';
import { GetGameResultDto } from '../dtos/get-game-result.dto';
import { GameResult } from '../entity/game-result.entity';
import { Game, gameUpdate } from './game';
import { Paddle } from './submodule/paddle';
import { DIRECTION } from './submodule/enums';
import { gameData } from './submodule/game-data';
import { v4 as uuid } from 'uuid';
import { HttpStatus, Injectable, NotAcceptableException } from '@nestjs/common';
import { GetGameListDto } from '../dtos/get-game-list.dto';
import { MemberService } from 'src/member/member.service';

@Injectable()
export class GameService {
  constructor(private readonly memberService: MemberService) {}

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
      const interval = setInterval(async () => {
        gameUpdate(game);
        if (game.over === true) {
          clearInterval(interval);
          await this.endGameProcess(server, roomId, game);
        }
        server.to(roomId).emit('drawGame', game);
      }, 1000 / 50);
    } catch (e) {
      console.log(e);
    }
  }

  async endGameProcess(server: Server, roomId: string, game: Game) {
    const scores = await this.getDeltaScore(game);
    const gameResult = new GameResult(game, scores);
    this.memberService.setLadderScore(game.players[0].username, scores[0]);
    this.memberService.setLadderScore(game.players[1].username, scores[1]);
    gameResult.save(); // 저장
    server.to(roomId).emit('endGame', GetGameResultDto.fromEntity(gameResult));
    delete gameData.userToRoom[game.players[0].username];
    delete gameData.userToRoom[game.players[1].username];
    delete gameData.roomToGame[roomId];
  }

  async getLadderScore(username: string) {
    return await this.memberService.getLadderScore(username);
  }

  async getDeltaScore(game: Game) {
    const p1 = game.players[0];
    const p2 = game.players[1];
    const p1_ladder_score = await this.memberService.getLadderScore(p1.username);
    const p2_ladder_score = await this.memberService.getLadderScore(p2.username);
    const probabilityOfP1 = 1.0 / (1.0 + Math.pow(10, (p2_ladder_score - p1_ladder_score) / 400));
    const probabilityOfP2 = 1.0 / (1.0 + Math.pow(10, (p1_ladder_score - p2_ladder_score) / 400));
    let scores = [];

    if (p1.score > p2.score) {
      scores.push({ [p1_ladder_score]: 100 * (1 - probabilityOfP1) });
      scores.push({ [p2_ladder_score]: -1 * 100 * probabilityOfP2 });
    } else {
      scores.push({ [p1_ladder_score]: -1 * 100 * probabilityOfP1 });
      scores.push({ [p2_ladder_score]: 100 * (1 - probabilityOfP2) });
    }
    scores = scores.map((score) => {
      const origin = +Object.keys(score)[0];
      const delta = score[origin];
      if (origin + Math.floor(delta) < 0) return -origin;
      return Math.round(delta);
    });

    return scores;
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

  async createDefaultGame(username: string, access: string): Promise<string> {
    if (!username) throw NotAcceptableException;
    const roomId: string = uuid();
    const game: Game = new Game();
    let ladderScore = await this.getLadderScore(username);
    const paddle: Paddle = new Paddle('left', username, ladderScore);
    game.players.push(paddle);
    if (access === 'public') gameData.matchQueue.push(paddle);
    gameData.roomToGame[roomId] = game;
    gameData.userToRoom[username] = roomId;
    game.leftOrRight[username] = 0;
    return roomId;
  }

  async createCustomGame(username: string, data): Promise<string> {
    const roomId: string = await this.createDefaultGame(username, data.type);
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
