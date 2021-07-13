import { useEffect } from 'react';
import io from 'socket.io-client';

const Pong = () => {
  const socket = io('ws://localhost:81/pong');
  let nickname = '';

  let canvas = null;
  let context = null;

  const keydown = () => {
    socket.emit('key-action', { player: nickname, move: 1 });
  };

  const keyup = () => {
    socket.emit('key-action', { player: nickname, move: -1 });
  };

  const init = () => {
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
  };

  const draw = gameState => {
    console.log('draw');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';

    // draw player1

    // draw player2

    // draw ball

    // draw net
    context.beginPath();
    context.setLineDash([7, 15]);
    context.moveTo(canvas.width / 2, canvas.height - 140);
    context.lineTo(canvas.width / 2, 140);
    context.lineWidth = 10;
    context.strokeStyle = '#ffffff';
    context.stroke();

    // draw the players score (left)

    // draw the paddles score (right)

    // change the font size for the center score text
    context.font = '30px Courier New';

    // draw the winning score (center)

    // change the font size for the center score value
    context.font = '40px Courier';

    // draw the current round number
  };

  const drawGame = gameState => {
    console.log('drawGame');
    console.log(gameState);
    if (!context) return;
    requestAnimationFrame(() => {
      draw(gameState);
    });
  };

  useEffect(() => {
    nickname = prompt('닉네임?');
    if (!nickname) window.location.reload();
    canvas = document.querySelector('canvas');
    context = canvas.getContext('2d');
    canvas.width = 700;
    canvas.height = 500;
    draw();

    socket.emit('ready', { player: nickname });

    socket.on('init', init);
    socket.on('drawGame', drawGame);
  }, []);

  return (
    <div>
      <canvas></canvas>
    </div>
  );
};

export default Pong;
