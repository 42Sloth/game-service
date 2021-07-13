// import {
//   ConnectedSocket,
//   MessageBody,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';
// import { Client, Server } from 'socket.io';

// @WebSocketGateway(81, { namespace: 'chat' })
// export class ChatGateway {
//   @WebSocketServer()
//   server: Server;

//   // handleConnection(client: Client) {}

//   // handleDisconnect(client: Client) {}

//   @SubscribeMessage('hihi')
//   connectSomeone(
//     @MessageBody() data: string,
//     // @ConnectedSocket() client: Client,
//   ) {
//     const [nickname, room] = data;
//     console.log(`${nickname}님이 코드: ${room}방에 접속했습니다.`);
//     const comeOn = `${nickname}님이 입장했습니다.`;
//     this.server.emit('comeOn' + room, comeOn);
//   }

//   // @SubscribeMessage('hihi')
//   // hi(@MessageBody() data: string) {
//   //   console.log(data);
//   // }

//   // private broadcast(event, client, message: any) {
//   //   for (const id in this.server.sockets)
//   //     if (id !== client.id) this.server.sockets[id].emit(event, message);
//   // }

//   @SubscribeMessage('send_left')
//   sendLeftMessage(@MessageBody() data: string, @ConnectedSocket() client) {
//     // console.log('l', data);
//     // const [room, nickname, message] = data;
//     // console.log(`${client.id} : ${data}`);
//     // this.broadcast(room, client, [nickname, message]);
//     client.broadcast.emit('receive_right', data);
//   }
//   @SubscribeMessage('send_right')
//   sendRightMessage(@MessageBody() data: string, @ConnectedSocket() client) {
//     // console.log('r', data);
//     // const [room, nickname, message] = data;
//     // console.log(`${client.id} : ${data}`);
//     // this.broadcast(room, client, [nickname, message]);
//     // client.broadcast.emit(room, [nickname, message]);
//     client.broadcast.emit('receive_left', data);
//   }
//   @SubscribeMessage('ball')
//   ballMessage(@MessageBody() data: string, @ConnectedSocket() client) {
//     // console.log('ball', data);
//     client.emit('ball_location', data);
//   }

//   @SubscribeMessage('left_ready')
//   leftReadyMessage(@MessageBody() data: string, @ConnectedSocket() client) {
//     console.log('ball', data);
//     client.emit('ball_location', data);
//   }
// }
