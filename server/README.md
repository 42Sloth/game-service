# NestJS_Chat
>NestJS 게이트웨이를 활용한 채팅 서버 구현 😄

닉네임과 방에 대한 코드를 입력하여 같은 방에 있는 이용자끼리 실시간 채팅을 할 수 있습니다!

## 사용한 것
Node.js, TypeScript, NestJS, WebSocket 

## 구현 화면
![스크린샷 2021-04-16 오후 10 50 47](https://user-images.githubusercontent.com/58046372/115034843-e83f1300-9f06-11eb-9387-1db6b0d2791f.png)

## 주요 코드

**게이트웨이**
- 포트번호를 81로 설정하고 네임스페이스를 chat으로 설정합니다.
```ts
@WebSocketGateway(81, { namespace: 'chat' })
export class ChatGateway {
...
```


**socket.io의 broadcast를 websocket으로 구현**
- socket.io의 broadcast(자신을 제외한 사용자에게 이벤트 전송)을 구현한 코드입니다. 
```ts
private broadcast(event, client, message: any) {
    for (let c of this.wsClients) {
      if (client.id == c.id)
        continue;
      c.emit(event, message);
    }
  }
```

**사용자에게 메세지 전송**
- ``send``를 감지했을 때 다른 사용자에게 메세지를 전송합니다.
```ts
  @SubscribeMessage('send')
  sendMessage(@MessageBody() data: string, @ConnectedSocket() client) {
    const [room, nickname, message] = data;
    console.log(`${client.id} : ${data}`);
    this.broadcast(room, client, [nickname, message]);
  }
}
```
