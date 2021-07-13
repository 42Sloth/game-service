import { Socket } from 'socket.io';
import {gameLoop, Game, DIRECTION} from './pong'

export class PongService {
    game: Game;
    constructor() {
        this.game = new Game();
    }
    startInterval(client: Socket) {
        try {
        setInterval(() =>{
            gameLoop(this.game);
            client.emit('drawGame', this.game);
        }, 1000 / 50)
    } catch (e) {
        console.log(e);
    }
    }

    updatePaddle(info) {
        if (info.type === 'up') {
            if (info.keyCode === 87 || info.keyCode == 83)
                this.game.player_left.move = DIRECTION.IDLE;
            else
                this.game.player_right.move = DIRECTION.IDLE;
        } else if (info.type === 'down') {
            if (info.keyCode === 87) this.game.player_left.move = DIRECTION.UP;
            if (info.keyCode === 83) this.game.player_left.move = DIRECTION.DOWN;
            if (info.keyCode === 38) this.game.player_right.move = DIRECTION.UP;
            if (info.keyCode === 40) this.game.player_right.move = DIRECTION.DOWN;
        }
    }

}