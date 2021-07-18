import { useEffect } from 'react';
import io from 'socket.io-client';
import { getParameterByName } from '../utils/utils';

const ip = process.env.REACT_APP_GAME_SOCKET_IP;
const port = process.env.REACT_APP_GAME_SOCKET_PORT;

const Game = () => {
  const socket = io(`ws://${ip}:${port}/game`);
  let username = '';

  let canvas = null;
  let context = null;

  const keydown = e => {
    if (e.keyCode === 38 || e.keyCode === 40)
      socket.emit('key-action', { username: username, type: 'down', keyCode: e.keyCode });
  };

  const keyup = e => {
    if (e.keyCode === 38 || e.keyCode === 40)
      socket.emit('key-action', { username: username, type: 'up', keyCode: e.keyCode });
  };

  const spaceup = e => {
    console.log('key pressed', e.keyCode);

    if (e.keyCode === 32) {
      console.log('key pressed', e.keyCode);
      socket.emit('ready', { username: username, type: 'up', keyCode: e.keyCode });
    }
  };

  const init = () => {
    console.log('init');
    document.removeEventListener('keyup', spaceup);
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
  };

  const draw = gameState => {
    const player_left = gameState.players[0];
    const player_right = gameState.players[1];

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    // draw ready
    if (!gameState.isStarted) {
      context.fillStyle = '#A0D4F7';
      if (player_left && player_left.ready === true)
        context.fillRect(0, 0, canvas.width / 2, canvas.height);
      if (player_right && player_right.ready === true)
        context.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height);

      context.fillStyle = 'white';
      context.font = '20px Courier New';
      context.fillText(
        '시작하려면 space bar를 눌러주세요.',
        canvas.width / 2 - 150,
        canvas.height - 50
      );
    }
    context.fillStyle = 'white';

    // draw player1
    if (player_left)
      context.fillRect(player_left.x, player_left.y, player_left.width, player_left.height);
    // draw player2
    if (player_right)
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

    // change the font size for the center score text
    context.font = '30px Courier New';

    // draw the players score (left)
    if (player_left) context.fillText(player_left.score.toString(), canvas.width / 2 - 300, 200);

    // draw the paddles score (right)
    if (player_right) context.fillText(player_right.score.toString(), canvas.width / 2 + 300, 200);
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
      username = prompt('닉네임?');
      if (!username) window.location.reload();
      socket.emit('enter', { username: username });
      document.addEventListener('keyup', spaceup);
      socket.on('init', init);
    } else if (id === '1') {
      socket.emit('enter', { username: getParameterByName('username') });
      document.addEventListener('keyup', spaceup);
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

export default Game;
