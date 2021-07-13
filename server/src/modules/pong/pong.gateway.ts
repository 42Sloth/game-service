import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';

  import {PongService } from '../pong/pong.service'
  import { Socket, Server } from 'socket.io';

  var ready = 0;

  @WebSocketGateway(81, { namespace: 'pong' })
  export class PongGateway {

    constructor(
        private readonly pongService: PongService,
      ) {}
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('ready')
    playerReadyProc(@ConnectedSocket() client: Socket, @MessageBody() playerName) {
        console.log('ready in ')
        ready++;
        if (ready >= 2) {
        // console.log('ready in 2')
        // client.emit('start');
        this.pongService.startInterval(client);
        client.emit('init');
        }
    }

    @SubscribeMessage('key-action')
    playerKeyPressed(@ConnectedSocket() client: Socket, @MessageBody() info) {
        this.pongService.updatePaddle(info);
    }

    // @SubscribeMessage('start')
    // gameStart(@ConnectedSocket() client: Socket) {
    //     console.log("start!!")
    // }
  }
