import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GameService } from './game.service';
import { Socket, Server } from 'socket.io';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Game } from './game';
import { Paddle } from './submodule/paddle';
import { BadRequestException } from '@nestjs/common';
import { gameData } from './submodule/game-data';

dotenv.config({ path: path.join(__dirname, '../../../.env') });
@WebSocketGateway(+process.env.PORT, { namespace: 'game' })
export class GameGateway {
  constructor(private readonly gameService: GameService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('exitGame')
  exitGame(@ConnectedSocket() client: Socket, @MessageBody() body) {
    const username: string = body.username;
    const roomId: string = gameData.userToRoom[username];
    const game: Game = gameData.roomToGame[roomId];

    if (!game) return;
    // 방장이 나갔으면
    if (game.players[0].username === username) {
      // 두 명이 있는데 나갔으면 클라이언트가 방장이 된다.
      if (game.players.length === 2) {
        const guestName: string = game.players[1].username;
        game.players.shift();
        game.players.shift();
        gameData.userToRoom[username] = null;
        delete gameData.userToRoom[username];
        (async () => {
          let ladderScore = await this.gameService.getLadderScore(guestName);
          game.players.push(new Paddle('left', guestName, ladderScore));
          game.leftOrRight[guestName] = 0;
          if (game.type === 'public') gameData.matchQueue.push(game.players[0]);
        })();
      }
      // 한명이 있는데 나갔으면 방터트려
      else if (game.players.length === 1) {
        gameData.roomToGame[roomId] = null;
        gameData.userToRoom[username] = null;
        delete gameData.roomToGame[roomId];
        delete gameData.userToRoom[username];
        gameData.matchQueue = gameData.matchQueue.filter((ele) => ele.username !== username);
      }
    }
    // 클라이언트가 나갔으면
    if (game.players.length == 2 && game.players[1].username === username) {
      game.players.pop();
      gameData.userToRoom[username] = null;
      delete gameData.userToRoom[username];
      if (game.type === 'public') gameData.matchQueue.push(game.players[0]);
    }
  }

  @SubscribeMessage('fastEnter')
  fastEnter(@ConnectedSocket() client: Socket, @MessageBody() body) {
    try {
      const username: string = body.username;
      if (!username) throw BadRequestException;
      // 사용자가 자기가 진행하고 있던 게임 방에 접속했을 때
      if (gameData.userToRoom[username]) {
        const roomId: string = gameData.userToRoom[username];
        const game: Game = gameData.roomToGame[roomId];
        client.join(roomId);
        if (game.isStarted) this.server.to(roomId).emit('permitToCtrl');
        else this.gameService.waitingInterval(this.server, roomId, game);
        return;
      }

      // 새로운 방 생성
      if (gameData.matchQueue.length == 0) {
        (async () => {
          const roomId: string = await this.gameService.createDefaultGame(username, 'public');
          const game: Game = gameData.roomToGame[roomId];
          client.join(roomId);
          this.gameService.waitingInterval(this.server, roomId, game);
        })();
      }
      // 게스트 들어왔을 때
      else if (gameData.matchQueue.length >= 1) {
        const roomOwner: Paddle = gameData.matchQueue.shift();
        const roomId: string = gameData.userToRoom[roomOwner.username];
        const game: Game = gameData.roomToGame[roomId];
        (async () => {
          let ladderScore = await this.gameService.getLadderScore(username);
          const roomGuest: Paddle = new Paddle('right', username, ladderScore);
          game.turn = roomGuest;
          game.players.push(roomGuest);
          // const roomGuest = gameData.matchQueue.shift();
          gameData.userToRoom[roomGuest.username] = roomId;
          game.players[1].username = roomGuest.username;
          game.leftOrRight[roomGuest.username] = 1;
          client.join(roomId);
          this.gameService.waitingInterval(this.server, roomId, game);
        })();
      }
    } catch (e) {
      console.log(e);
    }
  }

  @SubscribeMessage('selectEnter')
  selectEnter(@ConnectedSocket() client: Socket, @MessageBody() body) {
    const username: string = body.username;
    const roomId: string = body.roomId;

    // roomID가 없거나 username이 없거나 유효하지 않은 roomID인 경우
    if (!roomId || !username || !gameData.roomToGame[roomId]) {
      throw BadRequestException;
    }
    const game: Game = gameData.roomToGame[roomId];
    if (gameData.userToRoom[username]) {
      const roomId: string = gameData.userToRoom[username];
      const game: Game = gameData.roomToGame[roomId];
      client.join(roomId);
      if (game.isStarted) this.server.to(roomId).emit('permitToCtrl');
      else this.gameService.waitingInterval(this.server, roomId, game);
      return;
    }
    if (game.type === 'public') gameData.matchQueue.shift();
    (async () => {
      let ladderScore = await this.gameService.getLadderScore(username);
      const roomGuest: Paddle = new Paddle('right', username, ladderScore);
      game.turn = roomGuest;
      game.players.push(roomGuest);
      gameData.userToRoom[roomGuest.username] = roomId;
      game.players[1].username = roomGuest.username;
      game.leftOrRight[roomGuest.username] = 1;
      client.join(roomId);
      this.gameService.waitingInterval(this.server, roomId, game);
    })();
  }

  @SubscribeMessage('ready')
  playerReady(@ConnectedSocket() client: Socket, @MessageBody() body) {
    const username: string = body.username;
    const roomId: string = gameData.userToRoom[username];
    const game: Game = gameData.roomToGame[roomId];
    // game.players ready 해주는 부분
    if (game.players.length === 1) {
      if (game.players[0].username === username) game.players[0].ready = !game.players[0].ready;
    } else if (game.players.length === 2) {
      if (game.players[0].username === username) game.players[0].ready = !game.players[0].ready;
      else if (game.players[1].username === username) game.players[1].ready = !game.players[1].ready;
    }

    // 두명 다 ready 이면 시작 해주는 부분
    if (game.players.length === 2) {
      if (game.players[0].ready === true && game.players[1].ready === true) {
        this.server.to(roomId).emit('permitToCtrl');
        game.startAt = new Date();
        game.isStarted = true;
        this.gameService.startInterval(this.server, roomId, game);
      }
    }
  }

  // body : { roomId : '131242fwef' }
  @SubscribeMessage('spectEnter')
  playerJoin(@ConnectedSocket() client: Socket, @MessageBody() body) {
    const game: Game = gameData.roomToGame[body.roomId];
    client.join(body.roomId);
  }

  @SubscribeMessage('key-action')
  playerKeyPressed(@ConnectedSocket() client: Socket, @MessageBody() body) {
    if (gameData.userToRoom[body.username])
      this.gameService.updatePaddle(body, gameData.roomToGame[gameData.userToRoom[body.username]]);
  }
}
