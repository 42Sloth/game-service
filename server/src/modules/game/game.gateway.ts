import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import {GameService } from './game.service'
  import { Socket, Server } from 'socket.io';
  import * as dotenv from 'dotenv'
  import * as path from 'path';
import { Game, Paddle } from './game';
import { BadRequestException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { match } from 'assert';
import { elementAt } from 'rxjs';


  export interface IroomToGame {
    [roomId: string]: Game;
  }

  interface IuserToRoom {
    [username: string]: string;
  }

  export const userToRoom: IuserToRoom = {};
  export const roomToGame: IroomToGame = {};
  export let matchQueue: Paddle[] = [];

  dotenv.config({ path: path.join(__dirname, '../../../.env') });
  @WebSocketGateway(+process.env.PORT, { namespace: 'game' })
  export class GameGateway {

    constructor(
        private readonly gameService: GameService,
      ) {}
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('exitGame')
    exitGame(@ConnectedSocket() client: Socket, @MessageBody() body) {
      console.log("gooood", body.username);
      const username: string = body.username;
      const roomId: string = userToRoom[username];
      const game: Game = roomToGame[roomId];

      // 방장이 나갔으면
      if (game.players[0].username === username) {
        // 두 명이 있는데 나갔으면 클라이언트가 방장이 된다.
        if (game.players.length === 2) {
          const guestName : string = game.players[1].username;
          game.players.shift()
          game.players.shift()
          userToRoom[username] = null
          delete userToRoom[username]
          game.players.push(new Paddle('left', guestName));
          if (game.access === true)
            matchQueue.push(game.players[0]);
        }
        // 한명이 있는데 나갔으면 방터트려
        else if (game.players.length === 1) {
          roomToGame[roomId] = null
          userToRoom[username] = null
          delete roomToGame[roomId]
          delete userToRoom[username]
          matchQueue = matchQueue.filter(ele => ele.username !== username)
        }
      }
      // 클라이언트가 나갔으면
      if (game.players.length == 2 && game.players[1].username === username) {
        game.players.pop()
        userToRoom[username] = null
        delete userToRoom[username]
        if (game.access === true)
          matchQueue.push(game.players[0])
      }
      // client.leave(roomId);
    }

    @SubscribeMessage('fastEnter')
    fastEnter(@ConnectedSocket() client: Socket, @MessageBody() body) {
      console.log('enter in');
      try {
        const username = body.username;
        if (!username)
          throw BadRequestException;
        // 사용자가 자기가 진행하고 있던 게임 방에 접속했을 때
        if (userToRoom[username]) {
          const roomId = userToRoom[username];
          const game = roomToGame[roomId];
          client.join(roomId);
          if (game.isStarted)
            this.server.to(roomId).emit('permitToCtrl');
          else {
            console.log('here-===============')
            this.gameService.waitingInterval(this.server, roomId, game);
          }
          return ;
        }

        // 새로운 방 생성
        if (matchQueue.length == 0) {
          const roomId = this.gameService.createDefaultRoom(username);
          const game = roomToGame[roomId];
          client.join(roomId);
          this.gameService.waitingInterval(this.server, roomId, game);
        }
        // 게스트 들어왔을 때
        else if (matchQueue.length >= 1) {
          console.log('matchQueue size : ', matchQueue.length);
          const roomOwner = matchQueue.shift();
          console.log('Owner: ', roomOwner);
          console.log('guest in : ', matchQueue);
          const roomId = userToRoom[roomOwner.username];
          const game = roomToGame[roomId];
          const roomGuest: Paddle = new Paddle('right', username);
          game.turn = roomGuest;
          game.players.push(roomGuest);
          // const roomGuest = matchQueue.shift();
          userToRoom[roomGuest.username] = roomId;
          game.players[1].username = roomGuest.username;
          game.leftOrRight[roomGuest.username] = 1;
          client.join(roomId);
          this.gameService.waitingInterval(this.server, roomId, game);
        }
      } catch (e) {
        console.log(e);
      }
    }

    @SubscribeMessage('selectEnter')
    selectEnter(@ConnectedSocket() client: Socket, @MessageBody() body) {
      // roomID가 없거나 username이 없거나 유효하지 않은 roomID인 경우
      if (!body.roomId || !body.username || !roomToGame[body.roomId]) {
        throw BadRequestException;
      }
      const game: Game = roomToGame[body.roomId];
      if (userToRoom[body.username]) {
        const roomId = userToRoom[body.username];
        const game = roomToGame[roomId];
        client.join(roomId);
        if (game.isStarted)
          this.server.to(roomId).emit('permitToCtrl');
        else {
          console.log('here-===============')
          this.gameService.waitingInterval(this.server, roomId, game);
        }
        return ;
      }
      //TODO: 비번 걸려있으면 해제하는 로직 작성해야 함.
      // if (game.access === false && game.password !== body.password)
      //   throw BadRequestException;
      if (game.access === true)
        matchQueue.shift();
      const roomGuest: Paddle = new Paddle('right', body.username);
      game.turn = roomGuest;
      game.players.push(roomGuest);
      userToRoom[roomGuest.username] = body.roomId;
      game.players[1].username = roomGuest.username;
      game.leftOrRight[roomGuest.username] = 1;
      client.join(body.roomId);
      this.gameService.waitingInterval(this.server, body.roomId, game);
    }

    @SubscribeMessage('ready')
    playerReady(@ConnectedSocket() client: Socket, @MessageBody() body) {
        console.log('ready in ')
        const username = body.username;
        const roomId = userToRoom[username];
        const game: Game = roomToGame[roomId];
        // game.players
        // ready 해주는 부분
        if (game.players.length === 1) {
          if (game.players[0].username === username)
            game.players[0].ready = !game.players[0].ready;
        } else if (game.players.length === 2) {
          if (game.players[0].username === username)
            game.players[0].ready = !game.players[0].ready;
          else if (game.players[1].username === username)
            game.players[1].ready = !game.players[1].ready;
        }

        // 두명 다 ready 이면 시작 해주는 부분
        if (game.players.length === 2) {
          if (game.players[0].ready === true && game.players[1].ready === true)
          {
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
      const game: Game = roomToGame[body.roomId];
      client.join(body.roomId);
      // this.pongService.startInterval(this.server, body.roomId, roomToGame[body.roomId]);
    }

    @SubscribeMessage('key-action')
    playerKeyPressed(@ConnectedSocket() client: Socket, @MessageBody() body) {
      if (userToRoom[body.username])
        this.gameService.updatePaddle(body, roomToGame[userToRoom[body.username]]);
    }

  }
