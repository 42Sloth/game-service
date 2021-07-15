export function gameLoop(game: Game) {
    update(game)
}

export var DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
  };

var rounds = [10];
//var rounds = [2, 5, 3, 3, 2];
var colors = ['#1abc9c', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6'];

// The ball object (The cube that bounces back and forth)
class Ball{
    width: number;
    height: number;
    x: number;
    y: number;
    moveX: number;
    moveY: number;
    speed: number;
    constructor(incrementedSpeed) {
        this.width =18;
        this.height = 18;
        this.x = 341;
        this.y = 241;
        this.moveX = DIRECTION.IDLE;
        this.moveY= DIRECTION.IDLE;
        this.speed = incrementedSpeed || 12;
    }
}

// The paddle object (The two lines that move up and down)
class Paddle {
    width: number;
    height: number;
    x: number;
    y: number;
    score: number;
    move: number;
    speed: number;
    ready: boolean;
    username: string;

    constructor(side, username){
        this.width =18;
        this.height = 70;
        this.x = side === 'left' ? 150 : 550;
        this.y = 215;
        this.score = 0;
        this.move = DIRECTION.IDLE;
        this.speed = 10;
        this.ready = false;
        this.username = username;
    }
}

interface ISide {
  [username: string]: number;
}

export class Game {
    players: Paddle[];
    ball: Ball;
    running: boolean;
    over: boolean;
    turn: Paddle;
    timer: number;
    round: number;
    color: string;
    leftOrRight: ISide;

    constructor(leftUser, rightUser) {
    this.players = [];
    this.players.push(new Paddle('left', leftUser));
    this.players.push(new Paddle('right', rightUser));
    this.ball = new Ball(2);
    this.running = false;
    this.over = false;
    this.turn = this.players[1];
    this.timer = this.round = 0;
    // this.color = '#2c3e50';
    this.color = '#000000';
    this.leftOrRight = {};
}

    _resetTurn(victor, loser) : void {
    this.ball = new Ball(this.ball.speed);
    this.turn = loser;
    this.timer = new Date().getTime();
    victor.score++;
    // beep2.play();
    }

  // Wait for a delay to have passed after each turn.
    _turnDelayIsOver() {
    return new Date().getTime() - this.timer >= 1000;
    }
}


function update(Pong: Game) {
    if (!Pong.over) {
      const player_left = Pong.players[0];
      const player_right = Pong.players[1];
      // If the ball collides with the bound limits - correct the x and y coords.
      if (Pong.ball.x <= 0) Pong._resetTurn.call(Pong, player_right, player_left);
      if (Pong.ball.x >= 682)
        Pong._resetTurn.call(Pong, player_left, player_right);
      if (Pong.ball.y <= 0) Pong.ball.moveY = DIRECTION.DOWN;
      if (Pong.ball.y >= 482) Pong.ball.moveY = DIRECTION.UP;

      // Move player if they player.move value was updated by a keyboard event
      if (player_left.move === DIRECTION.UP) player_left.y -= player_left.speed;
      else if (player_left.move === DIRECTION.DOWN)
        player_left.y += player_left.speed;
      // Move player if they player.move value was updated by a keyboard event
      if (player_right.move === DIRECTION.UP)
        player_right.y -= player_right.speed;
      else if (player_right.move === DIRECTION.DOWN)
        player_right.y += player_right.speed;

      // On new serve (start of each turn) move the ball to the correct side
      // and randomize the direction to add some challenge.
      if (Pong._turnDelayIsOver.call(Pong) && Pong.turn) {
        Pong.ball.moveX = Pong.turn === player_left ? DIRECTION.LEFT : DIRECTION.RIGHT;
        Pong.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
        Pong.ball.y = Math.floor(Math.random() * 500 - 200) + 200;
        Pong.turn = null;
      }

      // If the player collides with the bound limits, update the x and y coords.
      if (player_left.y <= 0) player_left.y = 0;
      else if (player_left.y >= 500 - player_left.height)
        player_left.y = 500 - player_left.height;

      if (player_right.y <= 0) player_right.y = 0;
      else if (player_right.y >= 500 - player_right.height)
        player_right.y = 500 - player_right.height;

      // Move ball in intended direction based on moveY and moveX values
      if (Pong.ball.moveY === DIRECTION.UP) Pong.ball.y -= Pong.ball.speed / 1.5;
      else if (Pong.ball.moveY === DIRECTION.DOWN) Pong.ball.y += Pong.ball.speed / 1.5;
      if (Pong.ball.moveX === DIRECTION.LEFT) Pong.ball.x -= Pong.ball.speed;
      else if (Pong.ball.moveX === DIRECTION.RIGHT) Pong.ball.x += Pong.ball.speed;

      // Handle Player-Ball collisions
      if (
        Pong.ball.x - Pong.ball.width <= player_left.x &&
        Pong.ball.x >= player_left.x - player_left.width
      ) {
        if (
          Pong.ball.y <= player_left.y + player_left.height &&
          Pong.ball.y + Pong.ball.height >= player_left.y
        ) {
          Pong.ball.x = player_left.x + Pong.ball.width;
          Pong.ball.moveX = DIRECTION.RIGHT;
        }
      }

      // Handle paddle-ball collision
      if (
        Pong.ball.x - Pong.ball.width <= player_right.x &&
        Pong.ball.x >= player_right.x - player_right.width
      ) {
        if (
          Pong.ball.y <= player_right.y + player_right.height &&
          Pong.ball.y + Pong.ball.height >= player_right.y
        ) {
          Pong.ball.x = player_right.x - Pong.ball.width;
          Pong.ball.moveX = DIRECTION.LEFT;

          // beep1.play();
        }
      }
    }
}
