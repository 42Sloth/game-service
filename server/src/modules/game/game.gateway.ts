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
import { v4 as uuid } from 'uuid';


  export interface IroomToGame {
    [roomId: string]: Game;
  }

  interface IuserToRoom {
    [username: string]: string;
  }

  export const userToRoom: IuserToRoom = {};
  export const roomToGame: IroomToGame = {};
  export const matchQueue: Paddle[] = [];

  dotenv.config({ path: path.join(__dirname, '../../../.env') });
  @WebSocketGateway(+process.env.PORT, { namespace: 'game' })
  export class GameGateway {

    constructor(
        private readonly gameService: GameService,
      ) {}
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('enter')
    playerEnter(@ConnectedSocket() client: Socket, @MessageBody() body) {
        console.log('enter in ')
        const username = body.username;
        // 사용자가 자기가 진행하고 있던 게임 방에 접속했을 때
        if (userToRoom[username]) {
          const roomId = userToRoom[username];
          client.join(roomId);
          this.server.to(roomId).emit('init');
          return ;
        }

        // 새로운 방 생성
        if (matchQueue.length == 0) {
          const roomId = uuid();
          const game = new Game();
          const paddle: Paddle = new Paddle('left', username);
          game.players.push(paddle);
          matchQueue.push(paddle);
          // game.players.push(new Paddle('right', 'nothing'));
          roomToGame[roomId] = game;
          userToRoom[username] = roomId;
          game.leftOrRight[username] = 0;
          client.join(roomId);
          this.gameService.waitingInterval(this.server, roomId, game);
        }
        // 게스트 들어왔을 때
        else if (matchQueue.length == 1) {
          const roomOwner = matchQueue.shift();
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
    }

    @SubscribeMessage('ready')
    playerReady(@ConnectedSocket() client: Socket, @MessageBody() body) {
        console.log('ready in ')
        const username = body.username;
        const roomId = userToRoom[username];
        const game: Game = roomToGame[roomId];

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
            this.server.to(roomId).emit('init');
            game.startAt = new Date();
            game.isStarted = true;
            this.gameService.startInterval(this.server, roomId, game);
          }
        }
    }

    // body : { roomId : '131242fwef' }
    @SubscribeMessage('join')
    playerJoin(@ConnectedSocket() client: Socket, @MessageBody() body) {
      client.join(body.roomId);
      // this.pongService.startInterval(this.server, body.roomId, roomToGame[body.roomId]);
    }

    @SubscribeMessage('key-action')
    playerKeyPressed(@ConnectedSocket() client: Socket, @MessageBody() body) {
        this.gameService.updatePaddle(body, roomToGame[userToRoom[body.username]]);
    }

  }
