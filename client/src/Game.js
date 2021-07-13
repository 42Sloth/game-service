import { useEffect } from 'react';
import io from 'socket.io-client';

const Game = () => {
  useEffect(() => {
    const socket = io('ws://localhost:81/chat');
    socket.on('receive_left', data => {
      Pong.player_right.y = data;
    });
    socket.on('receive_right', data => {
      Pong.player_left.y = data;
    });
    // socket.on('ball_location', data => {
    //   Pong.ball.x = data.x;
    //   Pong.ball.y = data.y;
    // });

    var DIRECTION = {
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
    var Ball = {
      new: function (incrementedSpeed) {
        return {
          width: 18,
          height: 18,
          x: this.canvas.width / 2 - 9,
          y: this.canvas.height / 2 - 9,
          moveX: DIRECTION.IDLE,
          moveY: DIRECTION.IDLE,
          speed: incrementedSpeed || 12
        };
      }
    };

    // The paddle object (The two lines that move up and down)
    var Paddle = {
      new: function (side) {
        return {
          width: 18,
          height: 70,
          x: side === 'left' ? 150 : this.canvas.width - 150,
          y: this.canvas.height / 2 - 35,
          score: 0,
          move: DIRECTION.IDLE,
          //   speed: 10
          speed: 20,
          ready: false
        };
      }
    };

    var Game = {
      initialize: function () {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');

        this.canvas.width = 1400;
        this.canvas.height = 1000;

        this.canvas.style.width = this.canvas.width / 2 + 'px';
        this.canvas.style.height = this.canvas.height / 2 + 'px';

        this.player_left = Paddle.new.call(this, 'left');
        this.player_right = Paddle.new.call(this, 'right');
        this.ball = Ball.new.call(this);
        this.running = this.over = false;
        this.turn = this.player_right;
        this.timer = this.round = 0;
        // this.color = '#2c3e50';
        this.color = '#000000';

        Pong.menu();
        Pong.listen();
      },

      endGameMenu: function (text) {
        // Change the canvas font size and color
        Pong.context.font = '50px Courier New';
        Pong.context.fillStyle = this.color;

        // Draw the rectangle behind the 'Press any key to begin' text.
        Pong.context.fillRect(Pong.canvas.width / 2 - 350, Pong.canvas.height / 2 - 48, 700, 100);

        // Change the canvas color;
        Pong.context.fillStyle = '#ffffff';

        // Draw the end game menu text ('Game Over' and 'Winner')
        Pong.context.fillText(text, Pong.canvas.width / 2, Pong.canvas.height / 2 + 15);

        setTimeout(function () {
          Pong = Object.assign({}, Game);
          Pong.initialize();
        }, 3000);
      },

      menu: function () {
        // Draw all the Pong objects in their current state
        Pong.draw();

        // Change the canvas font size and color
        this.context.font = '50px Courier New';
        this.context.fillStyle = this.color;

        // Draw the rectangle behind the 'Press any key to begin' text.
        this.context.fillRect(this.canvas.width / 2 - 350, this.canvas.height / 2 - 48, 700, 100);

        // Change the canvas color;
        this.context.fillStyle = '#ffffff';

        // Draw the 'press any key to begin' text
        this.context.fillText(
          'Press any key to begin',
          this.canvas.width / 2,
          this.canvas.height / 2 + 15
        );
      },

      // Update all objects (move the player, paddle, ball, increment the score, etc.)
      update: function () {
        if (!this.over) {
          // If the ball collides with the bound limits - correct the x and y coords.
          if (this.ball.x <= 0) Pong._resetTurn.call(this, this.player_right, this.player_left);
          if (this.ball.x >= this.canvas.width - this.ball.width)
            Pong._resetTurn.call(this, this.player_left, this.player_right);
          if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
          if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

          // Move player if they player.move value was updated by a keyboard event
          if (this.player_left.move === DIRECTION.UP) this.player_left.y -= this.player_left.speed;
          else if (this.player_left.move === DIRECTION.DOWN)
            this.player_left.y += this.player_left.speed;
          // Move player if they player.move value was updated by a keyboard event
          if (this.player_right.move === DIRECTION.UP)
            this.player_right.y -= this.player_right.speed;
          else if (this.player_right.move === DIRECTION.DOWN)
            this.player_right.y += this.player_right.speed;

          // On new serve (start of each turn) move the ball to the correct side
          // and randomize the direction to add some challenge.
          if (Pong._turnDelayIsOver.call(this) && this.turn) {
            this.ball.moveX = this.turn === this.player_left ? DIRECTION.LEFT : DIRECTION.RIGHT;
            this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
            this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
            this.turn = null;
          }

          // If the player collides with the bound limits, update the x and y coords.
          if (this.player_left.y <= 0) this.player_left.y = 0;
          else if (this.player_left.y >= this.canvas.height - this.player_left.height)
            this.player_left.y = this.canvas.height - this.player_left.height;

          if (this.player_right.y <= 0) this.player_right.y = 0;
          else if (this.player_right.y >= this.canvas.height - this.player_right.height)
            this.player_right.y = this.canvas.height - this.player_right.height;

          // Move ball in intended direction based on moveY and moveX values
          if (this.ball.moveY === DIRECTION.UP) this.ball.y -= this.ball.speed / 1.5;
          else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += this.ball.speed / 1.5;
          if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
          else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;

          // Handle Player-Ball collisions
          if (
            this.ball.x - this.ball.width <= this.player_left.x &&
            this.ball.x >= this.player_left.x - this.player_left.width
          ) {
            if (
              this.ball.y <= this.player_left.y + this.player_left.height &&
              this.ball.y + this.ball.height >= this.player_left.y
            ) {
              this.ball.x = this.player_left.x + this.ball.width;
              this.ball.moveX = DIRECTION.RIGHT;
            }
          }

          // Handle paddle-ball collision
          if (
            this.ball.x - this.ball.width <= this.player_right.x &&
            this.ball.x >= this.player_right.x - this.player_right.width
          ) {
            if (
              this.ball.y <= this.player_right.y + this.player_right.height &&
              this.ball.y + this.ball.height >= this.player_right.y
            ) {
              this.ball.x = this.player_right.x - this.ball.width;
              this.ball.moveX = DIRECTION.LEFT;

              // beep1.play();
            }
          }
        }

        // Handle the end of round transition
        // Check to see if the player won the round.
        if (this.player_left.score === rounds[this.round]) {
          // Check to see if there are any more rounds/levels left and display the victory screen if
          // there are not.
          if (!rounds[this.round + 1]) {
            this.over = true;
            setTimeout(function () {
              Pong.endGameMenu('Winner is player1!');
            }, 1000);
          }
        }
        // Check to see if the paddle/AI has won the round.
        else if (this.player_right.score === rounds[this.round]) {
          if (!rounds[this.round + 1]) {
            this.over = true;
            setTimeout(function () {
              Pong.endGameMenu('Winner is player2!');
            }, 1000);
          }
        }
      },

      // Draw the objects to the canvas element
      draw: function () {
        // Clear the Canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Set the fill style to black
        this.context.fillStyle = this.color;

        // Draw the background
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Set the fill style to white (For the paddles and the ball)
        this.context.fillStyle = '#ffffff';

        // Draw the Player
        this.context.fillRect(
          this.player_left.x,
          this.player_left.y,
          this.player_left.width,
          this.player_left.height
        );

        // Draw the Paddle
        this.context.fillRect(
          this.player_right.x,
          this.player_right.y,
          this.player_right.width,
          this.player_right.height
        );

        // Draw the Ball
        if (Pong._turnDelayIsOver.call(this)) {
          this.context.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        }

        // Draw the net (Line in the middle)
        this.context.beginPath();
        this.context.setLineDash([7, 15]);
        this.context.moveTo(this.canvas.width / 2, this.canvas.height - 140);
        this.context.lineTo(this.canvas.width / 2, 140);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();

        // Set the default canvas font and align it to the center
        this.context.font = '100px Courier New';
        this.context.textAlign = 'center';

        // Draw the players score (left)
        this.context.fillText(this.player_left.score.toString(), this.canvas.width / 2 - 300, 200);

        // Draw the paddles score (right)
        this.context.fillText(this.player_right.score.toString(), this.canvas.width / 2 + 300, 200);

        // Change the font size for the center score text
        this.context.font = '30px Courier New';

        // Draw the winning score (center)
        this.context.fillText('Round ' + (Pong.round + 1), this.canvas.width / 2, 35);

        // Change the font size for the center score value
        this.context.font = '40px Courier';

        // Draw the current round number
        this.context.fillText(
          rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1],
          this.canvas.width / 2,
          100
        );
      },

      loop: function () {
        Pong.update();
        socket.emit('ball', Pong.ball);
        socket.emit('send_left', Pong.player_left.y);
        socket.emit('send_right', Pong.player_right.y);

        Pong.draw();

        // If the game is not over, draw the next frame.
        if (!Pong.over) requestAnimationFrame(Pong.loop);
      },

      listen: function () {
        document.addEventListener('keydown', function (key) {
          // Handle the 'Press any key to begin' function and start the game.
          if (key.keyCode === 87 || key.keyCode === 83) {
            Pong.player_left.ready = true;
            socket.emit('left_ready', 'true');
          }
          if (key.keyCode === 38 || key.keyCode === 40) {
            Pong.player_right.ready = true;
            socket.emit('right_ready', 'true');
          }
          if (Pong.running === false && Pong.player_left.ready && Pong.player_right.ready) {
            Pong.running = true;
            window.requestAnimationFrame(Pong.loop);
          }

          if (key.keyCode === 87) Pong.player_left.move = DIRECTION.UP;
          if (key.keyCode === 83) Pong.player_left.move = DIRECTION.DOWN;
          if (key.keyCode === 38) Pong.player_right.move = DIRECTION.UP;
          if (key.keyCode === 40) Pong.player_right.move = DIRECTION.DOWN;
        });

        // Stop the player from moving when there are no keys being pressed.
        document.addEventListener('keyup', function (key) {
          if (key.keyCode === 87 || key.keyCode === 83) Pong.player_left.move = DIRECTION.IDLE;
          if (key.keyCode === 38 || key.keyCode === 40) Pong.player_right.move = DIRECTION.IDLE;
        });
      },

      // Reset the ball location, the player turns and set a delay before the next round begins.
      _resetTurn: function (victor, loser) {
        this.ball = Ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = new Date().getTime();
        victor.score++;
        // beep2.play();
      },

      // Wait for a delay to have passed after each turn.
      _turnDelayIsOver: function () {
        return new Date().getTime() - this.timer >= 1000;
      },

      // Select a random color as the background of each level/round.
      _generateRoundColor: function () {
        var newColor = colors[Math.floor(Math.random() * colors.length)];
        if (newColor === this.color) return Pong._generateRoundColor();
        return newColor;
      }
    };

    var Pong = Object.assign({}, Game);
    Pong.initialize();
  }, []);
  return (
    <div>
      <canvas></canvas>
    </div>
  );
};

export default Game;
