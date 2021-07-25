import { Game, gameUpdate } from '../game';
import { Paddle } from './paddle';

export interface IroomToGame {
  [roomId: string]: Game;
}

export interface IuserToRoom {
  [username: string]: string;
}

class GameData {
  userToRoom: IuserToRoom;
  roomToGame: IroomToGame;
  matchQueue: Paddle[];

  constructor() {
    this.userToRoom = {};
    this.roomToGame = {};
    this.matchQueue = [];
  }
}

export let gameData: GameData = new GameData();
