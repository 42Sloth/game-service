import { Server } from 'socket.io';
import { Not } from 'typeorm';
import { GameStatResponseDto } from '../dtos/GameStatResponseDto';
import { GameResult } from '../entity/GameResult.entity';
import {gameLoop, Game, DIRECTION, Paddle} from './game'
import { matchQueue, roomToGame, userToRoom } from './game.gateway';
import { v4 as uuid } from 'uuid';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NotAcceptableException } from '@nestjs/common';


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

    startInterval(server: Server, roomId: string, game: Game) {
        try {
        const interval = setInterval(() =>{
            gameLoop(game);
            if (game.over === true) {
                server.to(roomId).emit('endGame', game);
                this.insertResult(game);
                delete userToRoom[game.players[0].username];
                delete userToRoom[game.players[1].username];
                delete roomToGame[roomId];
                clearInterval(interval);
            }
            server.to(roomId).emit('drawGame', game);
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

    createDefaultRoom(username: string) : string {
        if (!username)
            throw (NotAcceptableException);
        const roomId = uuid();
        // const roomId = uuid();
        const game = new Game();
        const paddle: Paddle = new Paddle('left', username);
        game.players.push(paddle);
        matchQueue.push(paddle);
        roomToGame[roomId] = game;
        userToRoom[username] = roomId;
        game.leftOrRight[username] = 0;
        return roomId;
    }

    createCustomRoom(data) : string {
        const roomId = this.createDefaultRoom(data.username);
        const game: Game = roomToGame[roomId];
        game.ball.setSpeedByType(data.speed);
        game.color = data.mapColor;
        // TODO:  roomName, ball 처리 해야함
        if (data.type === 'private')
            game.setPrivate(data.password);
        // else
        //     matchQueue.push(game.players[0]);
        console.log(game.players);
        return roomId;
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
            ],
            order: {
                startAt: "DESC"
            }
        })
        const res = items.map(item => GameStatResponseDto.fromEntity(item));
        return res;
    }
}
