import { Server, Socket } from 'socket.io';
import {gameLoop, Game, DIRECTION} from './pong'

export class PongService {
    // game: Game;
    // constructor() {
    //     this.game = new Game();
    // }
    startInterval(server: Server, room: string, game: Game) {
        try {
        setInterval(() =>{
            gameLoop(game);
            // client.emit('drawGame', this.game);
            // client.broadcast.emit('drawGame', this.game);
            server.to(room).emit('drawGame', game);
        }, 1000 / 50)
    } catch (e) {
        console.log(e);
    }
    }

    updatePaddle(info, game) {

        if (info.type === 'up') {
            if (info.keyCode === 87 || info.keyCode == 83)
                game.player_left.move = DIRECTION.IDLE;
            else
                game.player_right.move = DIRECTION.IDLE;
        } else if (info.type === 'down') {
            if (info.keyCode === 87) game.player_left.move = DIRECTION.UP;
            if (info.keyCode === 83) game.player_left.move = DIRECTION.DOWN;
            if (info.keyCode === 38) game.player_right.move = DIRECTION.UP;
            if (info.keyCode === 40) game.player_right.move = DIRECTION.DOWN;
        }
    }

}
