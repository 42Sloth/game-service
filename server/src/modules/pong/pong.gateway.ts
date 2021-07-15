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

  var ready = 0;

  interface ICount {
    [room: string]: number; // [room] = count
  }

  interface IGame {
    [room: string]: Game;
  }

  const clientRooms: ICount = {};
  const clientGames: IGame = {};

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
        const room = body.room;
        client.join(room);
        ready++;
        if (!clientRooms[room]) {
          clientRooms[room] = 1;
        } else {
          clientRooms[room]++;
        }
        if (clientRooms[room] === 2) {
          const game = new Game();
          clientGames[room] = game;
          this.pongService.startInterval(this.server, room, game);
          this.server.to(room).emit('init');
        }
    }

    @SubscribeMessage('key-action')
    playerKeyPressed(@ConnectedSocket() client: Socket, @MessageBody() body) {
        this.pongService.updatePaddle(body, clientGames[body.room]);
    }

  }
