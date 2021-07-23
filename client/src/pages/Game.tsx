import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { IGame, IGameResult } from '../interface/interface';

const ip = process.env.REACT_APP_GAME_SOCKET_IP;
const port = process.env.REACT_APP_GAME_SOCKET_PORT;

const WIDTH = 720;
const HEIGHT = 480;

interface ILocationData {
  roomId: string
  mode: string
  username: string | null
}

const Game = () => {
  const location = useLocation<ILocationData>();
  const roomId = location.state.roomId;
  const mode = location.state.mode;
  let username = location.state.username;
  const history = useHistory();
  const socket = io(`ws://${ip}:${port}/game`);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  const keydown = (e: any) => {
    if (e.keyCode === 38 || e.keyCode === 40) {
      socket.emit('key-action', { username: username, type: 'down', keyCode: e.keyCode });
    }
  };

  const keyup = (e: any) => {
    if (e.keyCode === 38 || e.keyCode === 40) {
      socket.emit('key-action', { username: username, type: 'up', keyCode: e.keyCode });
    }
  };

  const spaceup = (e: any) => {
    if (e.keyCode === 32) {
      socket.emit('ready', { username: username, type: 'up', keyCode: e.keyCode });
      setReady((ready) => !ready);
    }
  };

  const permitToCtrl = () => {
    document.removeEventListener('keyup', spaceup);
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
  };

  const draw = (gameState: IGame) => {
    if (!canvasRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const player_left = gameState.players[0];
    const player_right = gameState.players[1];

    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = gameState.color;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    // draw ready
    if (!gameState.isStarted) {
      context.fillStyle = '#A0D4F7';
      if (player_left && player_left.ready === true) context.fillRect(0, 0, WIDTH / 2, HEIGHT);
      if (player_right && player_right.ready === true) context.fillRect(WIDTH / 2, 0, WIDTH / 2, HEIGHT);

      context.fillStyle = '#aaa69d';
      context.font = '20px Courier New';
      context.fillText('시작하려면 space bar를 눌러주세요.', WIDTH / 2 - 150, HEIGHT - 50);
    }
    context.fillStyle = '#aaa69d';

    // draw player1
    if (player_left) context.fillRect(player_left.x, player_left.y, player_left.width, player_left.height);
    // draw player2
    if (player_right) context.fillRect(player_right.x, player_right.y, player_right.width, player_right.height);

    // draw net
    context.beginPath();
    context.setLineDash([7, 15]);
    context.moveTo(WIDTH / 2, HEIGHT - 140);
    context.lineTo(WIDTH / 2, 140);
    context.lineWidth = 8;
    context.strokeStyle = '#aaa69d';
    context.stroke();

    // draw ball
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.arc(gameState.ball.x, gameState.ball.y, 2 * gameState.ball.radius, 0, 2 * Math.PI);
    context.fill();

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

  const drawGame = (gameState: IGame) => {
    if (gameState.players[0].username === username) setReady(gameState.players[0].ready);
    else if (gameState.players[1] && gameState.players[1].username === username) setReady(gameState.players[1].ready);
    draw(gameState);
  };

  const endGame = (gameResult: IGameResult) => {
    document.removeEventListener('keyup', keyup);
    document.removeEventListener('keydown', keydown);

    /* drawGame에서 게임 시작 전의 player.ready 값을 ready state에 set 해줌.
     * 게임 시작 이후 ready state값은 true 인 상태.
     * 게임 종료 이후 나가기 버튼을 활성화 시키기 위해 ready state값을 false로 변경해야 함.
     * 게임 종료 'drawGame' 이벤트 리스너를 제거해
     * 아래의 ready state를 false로 변경하는 부분이 유효하도록 함.
     * 제거하지 않을 경우 drawGame()에서 계속 ready state값이 true가 됨.
     */
    const msg = `winner: ${gameResult.winner}\n 메인 화면으로 돌아가시겠습니까?`;
    if (window.confirm(msg)) history.push('/');
    else setReady(false);
  };

  const exitClick = () => {
    if (window.confirm('게임에서 나가시겠습니까?')) {
      socket.emit('exitGame', { username: username });
      document.removeEventListener('spaceup', spaceup);
      history.push('/');
    }
  };

  const init = async () => {
    // 빠른 시작
    if (mode === 'fastEnter') {
      while (!(username = prompt('닉네임?'))) {
        alert('닉네임을 입력해주세요!');
      }
      socket.emit('fastEnter', { username: username });
      document.addEventListener('keyup', spaceup);
      socket.on('permitToCtrl', permitToCtrl);
    }
    // 방 만들기
    else if (mode === 'createEnter') {
      socket.emit('selectEnter', { roomId: roomId, username: username });
      document.addEventListener('keyup', spaceup);
      socket.on('permitToCtrl', permitToCtrl);
    }
    // 플레이어로 게임 참여
    else if (mode === 'selectEnter') {
      while (!(username = prompt('닉네임?'))) {
        alert('닉네임을 입력해주세요!');
      }
      // TODO: 존재하는 room인지 확인하는 로직 추가
      socket.emit('selectEnter', { roomId: roomId, username: username });
      document.addEventListener('keyup', spaceup);
      socket.on('permitToCtrl', permitToCtrl);
    }
    // 게임 관전
    else if (mode === 'spectEnter') {
      // TODO: 존재하는 room인지 확인하는 로직 추가
      socket.emit('spectEnter', { roomId: roomId });
    }
    socket.on('drawGame', drawGame);
    socket.on('endGame', endGame);
  };

  useEffect(() => {
    init();
    return () => { socket.close() }
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {/* <audio autoPlay={true} loop={true} controls>
          <source src={process.env.PUBLIC_URL + '/Raindrop_Flower.mp3'}></source>
        </audio> */}
        <button onClick={exitClick} disabled={ready}>
          나가기
        </button>
      </div>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT}></canvas>
    </div>
  );
};

export default Game;
