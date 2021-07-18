import { Server } from 'socket.io';
import { Not } from 'typeorm';
import { GameStatResponseDto } from '../dtos/GameStatResponseDto';
import { GameResult } from '../entity/GameResult.entity';
import {gameLoop, Game, DIRECTION} from './game'

export class GameService {
    waitingInterval(server: Server, room: string, game: Game) {
        console.log(game);
        try {
            setInterval(() =>{
                server.to(room).emit('drawGame', game);
            }, 1000 / 50)
            } catch (e) {
                console.log(e);
            }
    }

    startInterval(server: Server, room: string, game: Game) {
        try {
        const interval = setInterval(() =>{
            gameLoop(game);
            if (game.over === true) {
                this.insertResult(game);
                clearInterval(interval);
            }
            server.to(room).emit('drawGame', game);
        }, 1000 / 50)
        } catch (e) {
            console.log(e);
        }
    }

    updatePaddle(info, game: Game) {
        if (info.type === 'up') {
            if (info.keyCode === 38) game.players[game.leftOrRight[info.username]].move = DIRECTION.IDLE;
            if (info.keyCode === 40) game.players[game.leftOrRight[info.username]].move = DIRECTION.IDLE;
        } else if (info.type === 'down') {
            if (info.keyCode === 38) game.players[game.leftOrRight[info.username]].move = DIRECTION.UP;
            if (info.keyCode === 40) game.players[game.leftOrRight[info.username]].move = DIRECTION.DOWN;
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

    async findByUsername(username: string) : Promise<GameStatResponseDto[]> {
        const gameRepository = GameResult.getRepository();
        const items = await gameRepository.find({
            where: [
                { playerLeft: username },
                { playerRight: username }
            ]
        })
        const res = items.map(item => GameStatResponseDto.fromEntity(item));
        return res;
    }
}
