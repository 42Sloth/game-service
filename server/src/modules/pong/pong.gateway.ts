import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import {PongService } from '../pong/pong.service'
  import { Socket, Server } from 'socket.io';
  import * as dotenv from 'dotenv'
  import * as path from 'path';
import { Game } from './pong';
import { User } from '../entity/User.entity';
import { v4 as uuid } from 'uuid';


  export interface IroomToGame {
    [roomId: string]: Game;
  }

  interface IuserToRoom {
    [username: string]: string;
  }

  export const userToRoom: IuserToRoom = {};
  export const roomToGame: IroomToGame = {};
  export const matchQueue: User[] = [];

  dotenv.config({ path: path.join(__dirname, '../../../.env') });
  @WebSocketGateway(+process.env.PORT, { namespace: 'pong' })
  export class PongGateway {

    constructor(
        private readonly pongService: PongService,
      ) {}
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('ready')
    playerReadyProc(@ConnectedSocket() client: Socket, @MessageBody() body) {
        console.log('ready in ')
        const username = body.player;
        if (userToRoom[username]) {
          const roomId = userToRoom[username];
          client.join(roomId);
          this.server.to(roomId).emit('init');
          return ;
        }
        matchQueue.push(new User(username, client));
        if (matchQueue.length === 2) {
          const user1 = matchQueue.shift();
          const user2 = matchQueue.shift();
          const roomId = uuid();
          userToRoom[user1.nickname] = roomId;
          userToRoom[user2.nickname] = roomId;
          const game = new Game(user1.nickname, user2.nickname);
          game.leftOrRight[user1.nickname] = 0;
          game.leftOrRight[user2.nickname] = 1;
          roomToGame[roomId] = game;
          user1.client.join(roomId);
          user2.client.join(roomId);
          this.pongService.startInterval(this.server, roomId, game)
          this.server.to(roomId).emit('init');
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
        this.pongService.updatePaddle(body, roomToGame[userToRoom[body.player]]);
    }

  }
