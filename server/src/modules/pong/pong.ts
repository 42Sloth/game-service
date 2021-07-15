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

    constructor(side){
        this.width =18;
        this.height = 70;
        this.x = side === 'left' ? 150 : 550;
        this.y = 215;
        this.score = 0;
        this.move = DIRECTION.IDLE;
        this.speed = 10;
        this.ready = false;
    }
}

export class Game {
    player_left: Paddle;
    player_right: Paddle;
    ball: Ball;
    running: boolean;
    over: boolean;
    turn: Paddle;
    timer: number;
    round: number;
    color: string;
    room: string;

    constructor() {
    // this.player_left = Paddle.new.call(this, 'left');
    this.player_left = new Paddle('left');
    this.player_right = new Paddle('right');
    // this.player_right = Paddle.new.call(this, 'right');
    this.ball = new Ball(2);
    this.running = false;
    this.over = false;
    this.turn = this.player_right;
    this.timer = this.round = 0;
    // this.color = '#2c3e50';
    this.color = '#000000';
    this.room = '';
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
      // If the ball collides with the bound limits - correct the x and y coords.
      if (Pong.ball.x <= 0) Pong._resetTurn.call(Pong, Pong.player_right, Pong.player_left);
      if (Pong.ball.x >= 682)
        Pong._resetTurn.call(Pong, Pong.player_left, Pong.player_right);
      if (Pong.ball.y <= 0) Pong.ball.moveY = DIRECTION.DOWN;
      if (Pong.ball.y >= 482) Pong.ball.moveY = DIRECTION.UP;

      // Move player if they player.move value was updated by a keyboard event
      if (Pong.player_left.move === DIRECTION.UP) Pong.player_left.y -= Pong.player_left.speed;
      else if (Pong.player_left.move === DIRECTION.DOWN)
        Pong.player_left.y += Pong.player_left.speed;
      // Move player if they player.move value was updated by a keyboard event
      if (Pong.player_right.move === DIRECTION.UP)
        Pong.player_right.y -= Pong.player_right.speed;
      else if (Pong.player_right.move === DIRECTION.DOWN)
        Pong.player_right.y += Pong.player_right.speed;

      // On new serve (start of each turn) move the ball to the correct side
      // and randomize the direction to add some challenge.
      if (Pong._turnDelayIsOver.call(Pong) && Pong.turn) {
        Pong.ball.moveX = Pong.turn === Pong.player_left ? DIRECTION.LEFT : DIRECTION.RIGHT;
        Pong.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
        Pong.ball.y = Math.floor(Math.random() * 500 - 200) + 200;
        Pong.turn = null;
      }

      // If the player collides with the bound limits, update the x and y coords.
      if (Pong.player_left.y <= 0) Pong.player_left.y = 0;
      else if (Pong.player_left.y >= 500 - Pong.player_left.height)
        Pong.player_left.y = 500 - Pong.player_left.height;

      if (Pong.player_right.y <= 0) Pong.player_right.y = 0;
      else if (Pong.player_right.y >= 500 - Pong.player_right.height)
        Pong.player_right.y = 500 - Pong.player_right.height;

      // Move ball in intended direction based on moveY and moveX values
      if (Pong.ball.moveY === DIRECTION.UP) Pong.ball.y -= Pong.ball.speed / 1.5;
      else if (Pong.ball.moveY === DIRECTION.DOWN) Pong.ball.y += Pong.ball.speed / 1.5;
      if (Pong.ball.moveX === DIRECTION.LEFT) Pong.ball.x -= Pong.ball.speed;
      else if (Pong.ball.moveX === DIRECTION.RIGHT) Pong.ball.x += Pong.ball.speed;

      // Handle Player-Ball collisions
      if (
        Pong.ball.x - Pong.ball.width <= Pong.player_left.x &&
        Pong.ball.x >= Pong.player_left.x - Pong.player_left.width
      ) {
        if (
          Pong.ball.y <= Pong.player_left.y + Pong.player_left.height &&
          Pong.ball.y + Pong.ball.height >= Pong.player_left.y
        ) {
          Pong.ball.x = Pong.player_left.x + Pong.ball.width;
          Pong.ball.moveX = DIRECTION.RIGHT;
        }
      }

      // Handle paddle-ball collision
      if (
        Pong.ball.x - Pong.ball.width <= Pong.player_right.x &&
        Pong.ball.x >= Pong.player_right.x - Pong.player_right.width
      ) {
        if (
          Pong.ball.y <= Pong.player_right.y + Pong.player_right.height &&
          Pong.ball.y + Pong.ball.height >= Pong.player_right.y
        ) {
          Pong.ball.x = Pong.player_right.x - Pong.ball.width;
          Pong.ball.moveX = DIRECTION.LEFT;

          // beep1.play();
        }
      }
    }
}
