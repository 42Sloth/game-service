export function gameLoop(game: Game) {
  update(game);
}

export var DIRECTION = {
  IDLE: 0,
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
};

enum SpeedEnum {
  Slow = 'slow',
  Moderate = 'moderate',
  Fast = 'fast',
}

enum SizeEnum {
  XL = 'xl',
  L = 'l',
  M = 'm',
  S = 's',
}

// The ball object (The cube that bounces back and forth)
class Ball {
  x: number;
  y: number;
  moveX: number;
  moveY: number;
  speed: number;
  defaultSpeed: number;
  radius: number;

  constructor(speed: number) {
    this.x = 360;
    this.y = 240;
    this.moveX = DIRECTION.IDLE;
    this.moveY = DIRECTION.IDLE;
    this.speed = speed;
    this.defaultSpeed = 5;
    this.radius = 7;
  }

  setSpeedByType(type: SpeedEnum) {
    if (type === 'slow') this.speed = 3;
    else if (type === 'moderate') this.speed = 4;
    else if (type === 'fast') this.speed = 5;
  }

  setSizeByType(type: SizeEnum) {
    if (type === 'xl') this.radius = 6;
    else if (type === 'l') this.radius = 5;
    else if (type === 'm') this.radius = 4;
    else if (type === 's') this.radius = 3;
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

  constructor(side: string, username: string) {
    this.width = 15;
    this.height = 70;
    this.x = side === 'left' ? 120 : 600;
    this.y = 240;
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
  type: string;
  password: string;

  constructor() {
    this.players = [];
    this.ball = new Ball(5);
    this.running = false;
    this.over = false;
    this.timer = 0;
    this.color = '#000000';
    this.leftOrRight = {};
    this.isStarted = false;
    this.endScore = 5;
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
      ((this.ball.defaultSpeed * 2 - this.ball.defaultSpeed) /
        (this.endScore * 2 - 1)) *
        this.ball.speed +
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
}

function update(game: Game) {
  const WIDTH: number = 720;
  const HEIGHT: number = 480;
  if (!game.over) {
    const [player_left, player_right]: Paddle[] = game.players;

    // If the ball collides with the bound limits - correct the x and y coords.
    if (game.ball.x - game.ball.radius <= 0)
      game._resetTurn.call(game, player_right, player_left);
    if (game.ball.x + game.ball.radius >= WIDTH)
      game._resetTurn.call(game, player_left, player_right);
    if (game.ball.y - game.ball.radius <= 0) game.ball.moveY = DIRECTION.DOWN;
    if (game.ball.y + game.ball.radius >= HEIGHT)
      game.ball.moveY = DIRECTION.UP;

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
      game.ball.moveX =
        game.turn === player_left ? DIRECTION.LEFT : DIRECTION.RIGHT;
      game.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][
        Math.round(Math.random())
      ];
      game.ball.y = Math.floor(Math.random() * 500 - 200) + 200;
      game.turn = null;
    }

    // If the player collides with the bound limits, update the x and y coords.
    if (player_left.y <= 0) player_left.y = 0;
    else if (player_left.y >= HEIGHT - player_left.height)
      player_left.y = HEIGHT - player_left.height;

    if (player_right.y <= 0) player_right.y = 0;
    else if (player_right.y >= HEIGHT - player_right.height)
      player_right.y = HEIGHT - player_right.height;

    // Move ball in intended direction based on moveY and moveX values
    if (game.ball.moveY === DIRECTION.UP) game.ball.y -= game.ball.speed / 1.5;
    else if (game.ball.moveY === DIRECTION.DOWN)
      game.ball.y += game.ball.speed / 1.5;
    if (game.ball.moveX === DIRECTION.LEFT) game.ball.x -= game.ball.speed;
    else if (game.ball.moveX === DIRECTION.RIGHT)
      game.ball.x += game.ball.speed;

    // Handle Player-Ball collisions
    if (
      game.ball.x - game.ball.radius <= player_left.x + player_left.width &&
      game.ball.x - game.ball.radius >= player_left.x
    ) {
      if (
        game.ball.y - game.ball.radius <= player_left.y + player_left.height &&
        game.ball.y + game.ball.radius >= player_left.y
      ) {
        game.ball.moveX = DIRECTION.RIGHT;
      }
    }

    // Handle paddle-ball collision
    if (
      game.ball.x + game.ball.radius >= player_right.x &&
      game.ball.x + game.ball.radius <= player_right.x + player_right.width
    ) {
      if (
        game.ball.y - game.ball.radius <=
          player_right.y + player_right.height &&
        game.ball.y + game.ball.radius >= player_right.y
      ) {
        game.ball.moveX = DIRECTION.LEFT;
      }
    }

    if (
      player_left.score === game.endScore ||
      player_right.score === game.endScore
    ) {
      game.over = true;
      game.endAt = new Date();
    }
  }
}
