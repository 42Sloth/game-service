import { useEffect } from 'react';
import io from 'socket.io-client';
import { getParameterByName } from '../utils/utils';

const ip = process.env.REACT_APP_GAME_SOCKET_IP;
const port = process.env.REACT_APP_GAME_SOCKET_PORT;

const Pong = () => {
  const socket = io(`ws://${ip}:${port}/pong`);
  let nickname = '';

  let canvas = null;
  let context = null;

  const keydown = e => {
    if (e.keyCode === 38 || e.keyCode === 40)
      socket.emit('key-action', { player: nickname, type: 'down', keyCode: e.keyCode });
  };

  const keyup = e => {
    if (e.keyCode === 38 || e.keyCode === 40)
      socket.emit('key-action', { player: nickname, type: 'up', keyCode: e.keyCode });
  };

  const init = () => {
    console.log('init');
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
  };

  const draw = gameState => {
    const player_left = gameState.players[0];
    const player_right = gameState.players[1];

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';

    // draw player1
    context.fillRect(player_left.x, player_left.y, player_left.width, player_left.height);
    // draw player2
    context.fillRect(player_right.x, player_right.y, player_right.width, player_right.height);

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
    context.fillText(player_left.score.toString(), canvas.width / 2 - 300, 200);

    // draw the paddles score (right)
    context.fillText(player_right.score.toString(), canvas.width / 2 + 300, 200);

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
    if (!context) return;
    requestAnimationFrame(() => {
      draw(gameState);
    });
  };

  useEffect(() => {
    const id = getParameterByName('id');
    if (id === '0') {
      nickname = prompt('닉네임?');
      if (!nickname) window.location.reload();
      socket.emit('ready', { player: nickname });
      socket.on('init', init);
    } else {
      socket.emit('join', { roomId: id });
    }
    canvas = document.querySelector('canvas');
    context = canvas.getContext('2d');
    canvas.width = 700;
    canvas.height = 500;
    socket.on('drawGame', drawGame);
  }, []);

  return (
    <div>
      <canvas></canvas>
    </div>
  );
};

export default Pong;
