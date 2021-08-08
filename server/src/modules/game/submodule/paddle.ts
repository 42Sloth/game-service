import { DIRECTION } from './enums';

// The paddle object (The two lines that move up and down)
export class Paddle {
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

  constructor(side: string, username: string, ladderScore: number) {
    this.width = 15;
    this.height = 70;
    this.x = side === 'left' ? 120 : 600;
    this.y = 240;
    this.score = 0;
    this.move = DIRECTION.IDLE;
    this.speed = 10;
    this.username = username;
    this.ready = false;
    this.ladderScore = ladderScore;
  }
}
