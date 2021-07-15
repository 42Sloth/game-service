import { useEffect } from 'react';
import io from 'socket.io-client';

const ip = process.env.REACT_APP_GAME_SOCKET_IP;
const port = process.env.REACT_APP_GAME_SOCKET_PORT;

const Pong = () => {
  const socket = io(`ws://${ip}:${port}/pong`);
  let nickname = '';
  let room = '';

  let canvas = null;
  let context = null;

  const keydown = e => {
    socket.emit('key-action', { player: nickname, type: 'down', keyCode: e.keyCode, room: room });
  };

  const keyup = e => {
    socket.emit('key-action', { player: nickname, type: 'up', keyCode: e.keyCode, room: room });
  };

  const init = () => {
    console.log('init');
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
  };

  const draw = gameState => {
    // console.log('draw');
    // console.log(gameState);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';

    // draw player1
    context.fillRect(
      gameState.player_left.x,
      gameState.player_left.y,
      gameState.player_left.width,
      gameState.player_left.height
    );
    // draw player2
    context.fillRect(
      gameState.player_right.x,
      gameState.player_right.y,
      gameState.player_right.width,
      gameState.player_right.height
    );

    // draw ball
    context.fillRect(
      gameState.ball.x,
      gameState.ball.y,
      gameState.ball.width,
      gameState.ball.height
    );

    // draw net
    context.beginPath();
    context.setLineDash([7, 15]);
    context.moveTo(canvas.width / 2, canvas.height - 140);
    context.lineTo(canvas.width / 2, 140);
    context.lineWidth = 10;
    context.strokeStyle = '#ffffff';
    context.stroke();

    // draw the players score (left)
    context.fillText(gameState.player_left.score.toString(), canvas.width / 2 - 300, 200);

    // draw the paddles score (right)
    context.fillText(gameState.player_right.score.toString(), canvas.width / 2 + 300, 200);

    // change the font size for the center score text
    context.font = '30px Courier New';

    // draw the winning score (center)
    context.fillText('Round ' + (gameState.round + 1), canvas.width / 2, 25);

    // change the font size for the center score value
    context.font = '40px Courier';

    // draw the current round number
    context.fillText(gameState.round, canvas.width / 2, 100);
  };

  const drawGame = gameState => {
    console.log('drawGame');
    // console.log(gameState);
    if (!context) return;
    requestAnimationFrame(() => {
      draw(gameState);
    });
  };

  useEffect(() => {
    nickname = prompt('닉네임?');
    if (!nickname) window.location.reload();
    room = prompt('방?');
    if (!room) window.location.reload();
    canvas = document.querySelector('canvas');
    context = canvas.getContext('2d');
    canvas.width = 700;
    canvas.height = 500;
    // draw();

    socket.emit('ready', { player: nickname, room: room });

    socket.on('init', init);
    socket.on('drawGame', drawGame);
    // socket.on('start', () => {
    //   console.log('start complete');
    // });
  }, []);

  return (
    <div>
      <canvas></canvas>
    </div>
  );
};

export default Pong;
