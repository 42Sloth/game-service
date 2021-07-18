import { useEffect } from 'react';
import io from 'socket.io-client';
import { getParameterByName } from '../utils/utils';

const ip = process.env.REACT_APP_GAME_SOCKET_IP;
const port = process.env.REACT_APP_GAME_SOCKET_PORT;

const Game = () => {
  const socket = io(`ws://${ip}:${port}/game`); // client가 가지고있는 server랑 통신할 수 있는 유일한 통로
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
    if (e.keyCode === 32) {
      socket.emit('ready', { username: username, type: 'up', keyCode: e.keyCode });
    }
  };

  const permitToCtrl = () => {
    console.log('permitToCtrl');
    document.removeEventListener('keyup', spaceup);
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
  };

  const draw = gameState => {
    const player_left = gameState.players[0];
    const player_right = gameState.players[1];

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = gameState.color;
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

  const endGame = gameState => {
    document.removeEventListener('keyup', keyup);
    document.removeEventListener('keydown', keydown);
    const msg = `winner: ${gameState.winner}\n 메인 화면으로 돌아가시겠습니까?`;
    if (window.confirm(msg)) window.location.href = '/';
  };

  useEffect(() => {
    // /game?id=${e.target.id}&type=0
    // /game?id=${type}&type=${type}&username=${roomInfo.username}
    // /game?id=${e.target.id}&type=2
    // /game?id=${e.target.id}&type=3
    const type = getParameterByName('type');
    const id = getParameterByName('id');
    // 빠른 시작
    if (type === '0') {
      while (!(username = prompt('닉네임?'))) {
        alert('닉네임을 입력해주세요!');
      }
      socket.emit('fastEnter', { username: username });
      document.addEventListener('keyup', spaceup);
      socket.on('permitToCtrl', permitToCtrl);
    }
    // 방 만들기
    else if (type === '1') {
      username = getParameterByName('username');
      console.log(id, username);
      socket.emit('selectEnter', { roomId: id, username: username });
      document.addEventListener('keyup', spaceup);
      socket.on('permitToCtrl', permitToCtrl);
    }
    // 플레이어로 게임 참여
    else if (type === '2') {
      while (!(username = prompt('닉네임?'))) {
        alert('닉네임을 입력해주세요!');
      }
      socket.emit('selectEnter', { roomId: id, username: username });
      document.addEventListener('keyup', spaceup);
      socket.on('permitToCtrl', permitToCtrl);
    }
    // 게임 관전
    else if (type === '3') {
      socket.emit('spectEnter', { roomId: id });
    }
    canvas = document.querySelector('canvas');
    context = canvas.getContext('2d');
    canvas.width = 700;
    canvas.height = 500;
    socket.on('drawGame', drawGame);
    socket.on('endGame', endGame);
  }, []);

  return (
    <div>
      <canvas></canvas>
    </div>
  );
};

export default Game;
