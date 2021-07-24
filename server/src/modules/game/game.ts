import { DIRECTION } from './submodule/enums';
import { Ball } from './submodule/ball';
import { Paddle } from './submodule/paddle';

interface ISide {
  [username: string]: number;
}

const WIDTH: number = 720;
const HEIGHT: number = 480;

export class Game {
  players: Paddle[];
  ball: Ball;
  info: Game;
  // running: boolean;
  over: boolean;
  turn: Paddle;
  timer: number;
  color: string;
  leftOrRight: ISide;
  isStarted: boolean;
  endScore: number;
  startAt: Date;
  endAt: Date;
  type: string;
  password: string;

  constructor() {
    this.players = [];
    this.ball = new Ball(5);
    // this.running = false;
    this.over = false;
    this.timer = 0;
    this.color = '#000000';
    this.leftOrRight = {};
    this.isStarted = false;
    this.endScore = 3;
    this.startAt = new Date();
    this.endAt = new Date();
    this.type = 'public';
  }

  setPrivate(password: string) {
    this.type = 'private';
    this.password = password;
  }

  _resetTurn(victor: Paddle, loser: Paddle): void {
    const ballNewSpeed: number =
      ((this.ball.defaultSpeed * 2 - this.ball.defaultSpeed) / (this.endScore * 2 - 1)) * this.ball.speed +
      this.ball.defaultSpeed;
    const radius = this.ball.radius;
    this.ball = new Ball(ballNewSpeed);
    this.ball.radius = radius;
    this.turn = loser;
    this.timer = new Date().getTime();
    victor.score++;
  }

  // Wait for a delay to have passed after each turn.
  _turnDelayIsOver(): boolean {
    return new Date().getTime() - this.timer >= 1000;
  }

  updateBallCollisionToBorder() {
    const [player_left, player_right]: Paddle[] = this.players;

    // If the ball collides with the bound limits - correct the x and y coords.
    if (this.ball.x - this.ball.radius <= 0) this._resetTurn.call(this, player_right, player_left);
    if (this.ball.x + this.ball.radius >= WIDTH) this._resetTurn.call(this, player_left, player_right);
    if (this.ball.y - this.ball.radius <= 0) this.ball.moveY = DIRECTION.DOWN;
    if (this.ball.y + this.ball.radius >= HEIGHT) this.ball.moveY = DIRECTION.UP;
  }

  updatePlayerMove(playerStr: string) {
    let player: Paddle;
    if (playerStr === 'left') player = this.players[0];
    else if (playerStr === 'right') player = this.players[1];

    // Move player if they player.move value was updated by a keyboard event
    if (player.move === DIRECTION.UP) player.y -= player.speed;
    else if (player.move === DIRECTION.DOWN) player.y += player.speed;
  }

  updateAfterGetScore() {
    const [player_left, player_right]: Paddle[] = this.players;

    // On new serve (start of each turn) move the ball to the correct side
    // and randomize the direction to add some challenge.
    if (this._turnDelayIsOver.call(this) && this.turn) {
      this.ball.moveX = this.turn === player_left ? DIRECTION.LEFT : DIRECTION.RIGHT;
      this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
      this.ball.y = Math.floor(Math.random() * 500 - 200) + 200;
      this.turn = null;
    }
  }

  limitPlayerCoordY(playerStr: string) {
    let player: Paddle;
    if (playerStr === 'left') player = this.players[0];
    else if (playerStr === 'right') player = this.players[1];

    // If the player collides with the bound limits, update the x and y coords.
    if (player.y <= 0) player.y = 0;
    else if (player.y >= HEIGHT - player.height) player.y = HEIGHT - player.height;
  }

  updateBallMove() {
    // Move ball in intended direction based on moveY and moveX values
    if (this.ball.moveY === DIRECTION.UP) this.ball.y -= this.ball.speed / 1.5;
    else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += this.ball.speed / 1.5;
    if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
    else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;
  }

  hitBallToPlayer() {
    const [player_left, player_right]: Paddle[] = this.players;

    // Handle Player-Ball collisions
    if (
      this.ball.x - this.ball.radius <= player_left.x + player_left.width &&
      this.ball.x - this.ball.radius >= player_left.x
    ) {
      if (
        this.ball.y - this.ball.radius <= player_left.y + player_left.height &&
        this.ball.y + this.ball.radius >= player_left.y
      ) {
        this.ball.moveX = DIRECTION.RIGHT;
      }
    }
    // Handle paddle-ball collision
    if (
      this.ball.x + this.ball.radius >= player_right.x &&
      this.ball.x + this.ball.radius <= player_right.x + player_right.width
    ) {
      if (
        this.ball.y - this.ball.radius <= player_right.y + player_right.height &&
        this.ball.y + this.ball.radius >= player_right.y
      ) {
        this.ball.moveX = DIRECTION.LEFT;
      }
    }
  }

  checkGameOver() {
    const [player_left, player_right]: Paddle[] = this.players;

    if (player_left.score === this.endScore || player_right.score === this.endScore) {
      this.over = true;
      this.endAt = new Date();
    }
  }
}

export function gameUpdate(game: Game) {
  if (!game.over && game.players.length == 2) {
    game.updateBallCollisionToBorder(); // 공이 테두리에 닿았을 때 동작 처리
    game.updatePlayerMove('left'); // 왼쪽 플레이어의 동작 처리
    game.updatePlayerMove('right'); // 오른쪽 플레이어의 동작 처리
    game.updateAfterGetScore(); // 점수가 났을 때 공의 위치 지정 및 약간의 딜레이 주는 처리
    game.limitPlayerCoordY('left'); // 왼쪽 플레이어의 움직일 수 있는 범위 제한
    game.limitPlayerCoordY('right'); // 오른쪽 플레이어의 움직일 수 있는 범위 제한
    game.updateBallMove(); // 공 움직임 처리
    game.hitBallToPlayer(); // 공이 플레이어 (Paddle)에 맞았을 때 처리
    game.checkGameOver(); // 게임이 끝났는 지 처리
  }
}
