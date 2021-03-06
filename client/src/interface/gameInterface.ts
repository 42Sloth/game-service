interface IBall {
  x: number;
  y: number;
  moveX: number;
  moveY: number;
  speed: number;
  defaultSpeed: number;
  radius: number;
}

interface IPaddle {
  width: number;
  height: number;
  x: number;
  y: number;
  score: number;
  move: number;
  speed: number;
  username: string;
  ready: boolean;
  ladderScore: number;
}

interface ISide {
  [username: string]: number;
}

export interface IGame {
  players: IPaddle[];
  ball: IBall;
  over: boolean;
  turn: IPaddle;
  timer: number;
  color: string;
  leftOrRight: ISide;
  isStarted: boolean;
  endScore: number;
  startAt: Date;
  endAt: Date;
  type: string;
  password: string;
}

export interface IGameResult {
  playerLeft: string;
  playerRight: string;
  winner: string;
  playerLeftScore: number;
  playerRightScore: number;
  startAt: Date;
  endAt: Date;
  playTime: number;
  playerLeftLadderScore: number;
  playerRightLadderScore: number;
  playerLeftDelta: number;
  playerRightDelta: number;
}

export interface IGameList {
  roomId: string;
  leftPlayer: string;
  rightPlayer: string;
  type: string;
}

export interface IGameStat {
  id: number;
  playerLeft: string;
  playerRight: string;
  winner: string;
  playerLeftScore: number;
  playerRightScore: number;
  playTime: number;
}

export interface IRoom {
  // username: string;
  type: string;
  password: string;
  speed: string;
  ball: string;
  mapColor: string;
}

export interface ILocation {
  roomId: string;
  mode: string;
  username: string | null;
}
