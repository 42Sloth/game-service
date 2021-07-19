import { useEffect } from 'react';
import io from 'socket.io-client';
import { getParameterByName } from '../utils/utils';

const ip = process.env.REACT_APP_GAME_SOCKET_IP;
const port = process.env.REACT_APP_GAME_SOCKET_PORT;

const WIDTH = 720;
const HEIGHT = 480;

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
    console.log(gameState);
    const player_left = gameState.players[0];
    const player_right = gameState.players[1];

    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = gameState.color;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    // draw ready
    if (!gameState.isStarted) {
      context.fillStyle = '#A0D4F7';
      if (player_left && player_left.ready === true) context.fillRect(0, 0, WIDTH / 2, HEIGHT);
      if (player_right && player_right.ready === true)
        context.fillRect(WIDTH / 2, 0, WIDTH / 2, HEIGHT);

      context.fillStyle = 'white';
      context.font = '20px Courier New';
      // 🚨
      context.fillText('시작하려면 space bar를 눌러주세요.', WIDTH / 2 - 150, HEIGHT - 50);
    }
    context.fillStyle = 'white';

    // draw player1
    if (player_left)
      context.fillRect(player_left.x, player_left.y, player_left.width, player_left.height);
    // draw player2
    if (player_right)
      context.fillRect(player_right.x, player_right.y, player_right.width, player_right.height);

    // draw ball
    // context.fillRect(
    //   gameState.ball.x,
    //   gameState.ball.y,
    //   gameState.ball.width,
    //   gameState.ball.height
    // );
    // TODO: 공이 작아지니까 패들에 안 맞았는데 튕기는 현상 발생.
    context.beginPath();
    // context.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, 2 * Math.PI);
    context.arc(gameState.ball.x, gameState.ball.y, 5, 0, 2 * Math.PI);
    context.fill();

    // draw net
    context.beginPath();
    context.setLineDash([7, 15]);
    context.moveTo(WIDTH / 2, HEIGHT - 140);
    context.lineTo(WIDTH / 2, 140);
    context.lineWidth = 10;
    context.strokeStyle = '#ffffff';
    context.stroke();

    // change the font size for the center score text
    context.font = '30px Courier New';

    // draw the players username, score (left)
    if (player_left) {
      context.fillText(`player1: ${player_left.username}`, 20, 50);
      context.fillText(player_left.score.toString(), WIDTH / 2 - 250, 100);
    }
    // draw the paddles username, score (right)
    if (player_right) {
      context.fillText(`player2: ${player_right.username}`, WIDTH / 2 + 20, 50);
      context.fillText(player_right.score.toString(), WIDTH / 2 + 250, 100);
    }
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
      // TODO: 존재하는 room인지 확인하는 로직 추가
      socket.emit('selectEnter', { roomId: id, username: username });
      document.addEventListener('keyup', spaceup);
      socket.on('permitToCtrl', permitToCtrl);
    }
    // 플레이어로 게임 참여
    else if (type === '2') {
      while (!(username = prompt('닉네임?'))) {
        alert('닉네임을 입력해주세요!');
      }
      // TODO: 존재하는 room인지 확인하는 로직 추가
      socket.emit('selectEnter', { roomId: id, username: username });
      document.addEventListener('keyup', spaceup);
      socket.on('permitToCtrl', permitToCtrl);
    }
    // 게임 관전
    else if (type === '3') {
      // TODO: 존재하는 room인지 확인하는 로직 추가
      socket.emit('spectEnter', { roomId: id });
    }
    canvas = document.querySelector('canvas');
    context = canvas.getContext('2d');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
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
