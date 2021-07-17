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
import { Game } from './game';
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
  @WebSocketGateway(+process.env.PORT, { namespace: 'game' })
  export class GameGateway {

    constructor(
        private readonly gameService: GameService,
      ) {}
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('ready')
    playerReadyProc(@ConnectedSocket() client: Socket, @MessageBody() body) {
        console.log('ready in ')
        const username = body.username;
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
          userToRoom[user1.username] = roomId;
          userToRoom[user2.username] = roomId;
          const game = new Game(user1.username, user2.username);
          game.leftOrRight[user1.username] = 0;
          game.leftOrRight[user2.username] = 1;
          roomToGame[roomId] = game;
          user1.client.join(roomId);
          user2.client.join(roomId);
          this.gameService.startInterval(this.server, roomId, game)
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
        this.gameService.updatePaddle(body, roomToGame[userToRoom[body.username]]);
    }

  }
