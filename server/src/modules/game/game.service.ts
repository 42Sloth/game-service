import { Server, Socket } from 'socket.io';
import { Not } from 'typeorm';
import { GameResult } from '../entity/GameResult.entity';
import {gameLoop, Game, DIRECTION} from './game'

export class GameService {
    startInterval(server: Server, room: string, game: Game) {
        try {
        setInterval(() =>{
            gameLoop(game);
            server.to(room).emit('drawGame', game);
        }, 1000 / 50)
        } catch (e) {
            console.log(e);
        }
    }

    updatePaddle(info, game: Game) {
        if (info.type === 'up') {
            if (info.keyCode === 38) game.players[game.leftOrRight[info.player]].move = DIRECTION.IDLE;
            if (info.keyCode === 40) game.players[game.leftOrRight[info.player]].move = DIRECTION.IDLE;
        } else if (info.type === 'down') {
            if (info.keyCode === 38) game.players[game.leftOrRight[info.player]].move = DIRECTION.UP;
            if (info.keyCode === 40) game.players[game.leftOrRight[info.player]].move = DIRECTION.DOWN;
        }
    }

    insertResult(game: Game) {
        const gameResult: GameResult = new GameResult(game);
        gameResult.save();
    }

    async countByUsername(username: string, type: number) : Promise<number> {
        const gameRepository = GameResult.getRepository();
        let [items, count] = [null, 0];
        // type 0 : win
        if (type === 0) {
            [items, count] = await gameRepository.findAndCount({
                where: [
                { playerLeft: username , winner: username},
                { playerRight: username, winner: username },
            ]});
        // type 1 : lose
        } else if (type === 1) {
            [items, count] = await gameRepository.findAndCount({
                where: [
                { playerLeft: username, winner: Not(username) },
                { playerRight: username, winner: Not(username) },
            ]});
        // type 2 : all
        } else if (type === 2) {
            [items, count] = await gameRepository.findAndCount({
                where: [
                { playerLeft: username },
                { playerRight: username },
            ]});
        }
        return count;
    }
}
