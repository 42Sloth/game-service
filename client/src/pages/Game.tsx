import { useEffect, useState, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { IGame, IGameResult, ILocation } from '../interface/gameInterface';

const ip = process.env.REACT_APP_GAME_SOCKET_IP;
const port = process.env.REACT_APP_GAME_SOCKET_PORT;

const WIDTH = 720;
const HEIGHT = 480;

const Game = () => {
  const location = useLocation<ILocation>();
  const roomId = location.state.roomId;
  const mode = location.state.mode;
  const username = location.state.username;
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
      context.fillText('??????????????? space bar??? ???????????????.', WIDTH / 2 - 150, HEIGHT - 50);
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
      context.fillText(player_left.ladderScore.toString(), WIDTH / 2 - 250, 100);
      context.fillText(player_left.score.toString(), WIDTH / 2 - 250, 150);
    }
    // draw the paddles username, score (right)
    if (player_right) {
      context.fillText(`player2: ${player_right.username}`, WIDTH / 2 + 20, 50);
      context.fillText(player_right.ladderScore.toString(), WIDTH / 2 + 250, 100);
      context.fillText(player_right.score.toString(), WIDTH / 2 + 250, 150);
    }
  };

  const drawGame = (gameState: IGame) => {
    if (gameState.players[0].username === username) {
      setReady(gameState.players[0].ready);
    } else if (gameState.players[1] && gameState.players[1].username === username) {
      setReady(gameState.players[1].ready);
    }
    draw(gameState);
  };

  const endGame = (gameResult: IGameResult) => {
    document.removeEventListener('keyup', keyup);
    document.removeEventListener('keydown', keydown);

    /* Authored by juhlee
     * drawGame?????? ?????? ?????? ?????? player.ready ?????? ready state??? set ??????.
     * ?????? ?????? ?????? ready state?????? true ??? ??????.
     * ?????? ?????? ?????? ????????? ????????? ????????? ????????? ?????? ready state?????? false??? ???????????? ???.
     * ?????? ?????? 'drawGame' ????????? ???????????? ?????????
     * ????????? ready state??? false??? ???????????? ????????? ??????????????? ???.
     * ???????????? ?????? ?????? drawGame()?????? ?????? ready state?????? true??? ???.
     * commented by taehkim : LGTM ????
     */
    socket.off('drawGame', drawGame);
    let deltaScore = 0;
    let ladderScore = 0;
    if (gameResult.playerLeft === username) {
      deltaScore = gameResult.playerLeftDelta;
      ladderScore = gameResult.playerLeftLadderScore;
    } else if (gameResult.playerRight === username) {
      deltaScore = gameResult.playerRightDelta;
      ladderScore = gameResult.playerRightLadderScore;
    }
    let deltaSign = deltaScore > 0 ? '+' : '';
    const msg = `winner: ${gameResult.winner}\n My Ladder Score is ${ladderScore} (${deltaSign}${deltaScore}) \n ?????? ???????????? ?????????????????????????`;
    if (window.confirm(msg)) history.push('/');
    else setReady(false);
  };

  const exitClick = () => {
    if (window.confirm('???????????? ??????????????????????')) {
      socket.emit('exitGame', { username: username });
      document.removeEventListener('spaceup', spaceup);
      history.push('/');
    }
  };

  const init = async () => {
    // ?????? ??????
    if (mode === 'fastEnter') {
      socket.emit('fastEnter', { username: username });
      document.addEventListener('keyup', spaceup);
      socket.on('permitToCtrl', permitToCtrl);
    }
    // ??? ?????????
    else if (mode === 'createEnter') {
      socket.emit('selectEnter', { roomId: roomId, username: username });
      document.addEventListener('keyup', spaceup);
      socket.on('permitToCtrl', permitToCtrl);
    }
    // ??????????????? ?????? ??????
    else if (mode === 'selectEnter') {
      // TODO: ???????????? room?????? ???????????? ?????? ??????
      socket.emit('selectEnter', { roomId: roomId, username: username });
      document.addEventListener('keyup', spaceup);
      socket.on('permitToCtrl', permitToCtrl);
    }
    // ?????? ??????
    else if (mode === 'spectEnter') {
      // TODO: ???????????? room?????? ???????????? ?????? ??????
      socket.emit('spectEnter', { roomId: roomId });
    }
    socket.on('drawGame', drawGame);
    socket.on('endGame', endGame);
  };

  useEffect(() => {
    init();
    return () => {
      socket.close();
    };
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {/* <audio autoPlay={true} loop={true} controls>
          <source src={process.env.PUBLIC_URL + '/Raindrop_Flower.mp3'}></source>
        </audio> */}
        <button onClick={exitClick} disabled={ready}>
          ?????????
        </button>
      </div>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT}></canvas>
    </div>
  );
};

export default Game;
