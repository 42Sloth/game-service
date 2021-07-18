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

    constructor(side, username){
        this.width =18;
        this.height = 70;
        this.x = side === 'left' ? 150 : 550;
        this.y = 215;
        this.score = 0;
        this.move = DIRECTION.IDLE;
        this.speed = 10;
        this.username = username;
        this.ready = false;
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
    color: string;
    leftOrRight: ISide;
    isStarted: boolean;
    endScore: number;
    startAt: Date;
    endAt: Date;

    constructor() {
      this.players = [];
      this.ball = new Ball(2);
      this.running = false;
      this.over = false;
      this.timer = 0;
      this.color = '#000000';
      this.leftOrRight = {};
      this.isStarted = false;
      this.endScore = 1;
      this.startAt = new Date();
      this.endAt = new Date();
    }

    _resetTurn(victor, loser) : void {
      this.ball = new Ball(this.ball.speed);
      this.turn = loser;
      this.timer = new Date().getTime();
      victor.score++;
    }

    // Wait for a delay to have passed after each turn.
    _turnDelayIsOver() {
      return new Date().getTime() - this.timer >= 1000;
    }
}


function update(game: Game) {
    if (!game.over) {
      const player_left = game.players[0];
      const player_right = game.players[1];
      // If the ball collides with the bound limits - correct the x and y coords.
      if (game.ball.x <= 0) game._resetTurn.call(game, player_right, player_left);
      if (game.ball.x >= 682)
        game._resetTurn.call(game, player_left, player_right);
      if (game.ball.y <= 0) game.ball.moveY = DIRECTION.DOWN;
      if (game.ball.y >= 482) game.ball.moveY = DIRECTION.UP;

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
      if (game._turnDelayIsOver.call(game) && game.turn) {
        game.ball.moveX = game.turn === player_left ? DIRECTION.LEFT : DIRECTION.RIGHT;
        game.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
        game.ball.y = Math.floor(Math.random() * 500 - 200) + 200;
        game.turn = null;
      }

      // If the player collides with the bound limits, update the x and y coords.
      if (player_left.y <= 0) player_left.y = 0;
      else if (player_left.y >= 500 - player_left.height)
        player_left.y = 500 - player_left.height;

      if (player_right.y <= 0) player_right.y = 0;
      else if (player_right.y >= 500 - player_right.height)
        player_right.y = 500 - player_right.height;

      // Move ball in intended direction based on moveY and moveX values
      if (game.ball.moveY === DIRECTION.UP) game.ball.y -= game.ball.speed / 1.5;
      else if (game.ball.moveY === DIRECTION.DOWN) game.ball.y += game.ball.speed / 1.5;
      if (game.ball.moveX === DIRECTION.LEFT) game.ball.x -= game.ball.speed;
      else if (game.ball.moveX === DIRECTION.RIGHT) game.ball.x += game.ball.speed;

      // Handle Player-Ball collisions
      if (
        game.ball.x - game.ball.width <= player_left.x &&
        game.ball.x >= player_left.x - player_left.width
      ) {
        if (
          game.ball.y <= player_left.y + player_left.height &&
          game.ball.y + game.ball.height >= player_left.y
        ) {
          game.ball.x = player_left.x + game.ball.width;
          game.ball.moveX = DIRECTION.RIGHT;
        }
      }

      // Handle paddle-ball collision
      if (
        game.ball.x - game.ball.width <= player_right.x &&
        game.ball.x >= player_right.x - player_right.width
      ) {
        if (
          game.ball.y <= player_right.y + player_right.height &&
          game.ball.y + game.ball.height >= player_right.y
        ) {
          game.ball.x = player_right.x - game.ball.width;
          game.ball.moveX = DIRECTION.LEFT;
        }
      }

      if (player_left.score === game.endScore || player_right.score === game.endScore) {
        game.over = true;
        game.endAt = new Date();
      }
    }
}
