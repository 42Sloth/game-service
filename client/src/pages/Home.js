import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';

const ip = process.env.REACT_APP_GAME_SERVER_IP;
const port = process.env.REACT_APP_GAME_SERVER_PORT;
const res_url = `http://${ip}:${port}`;

const colors = { 0: '#b71540', 1: '#ffda79', 2: '#0a3d62', 3: '#78e08f' };

const Home = () => {
  const [gameList, setGameList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  let password = '';

  const getList = async () => {
    try {
      const response = await axios.get(`${res_url}/game/list`);
      setGameList(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = e => {
    if (e.target.id === '0') window.location.href = `/game?id=${e.target.id}&type=0`;
    else {
      const roomId = e.target.id;
      const mode = e.target.value;
      if (gameList[e.target.name].type === 'private') {
        password = window.prompt('4자리 비밀번호를 입력해주세요');
        console.log('password', password);
        if (password) {
          enterPrivateRoom(roomId, password, mode);
        }
      } else {
        if (e.target.value === 'selectEnter')
          window.location.href = `/game?id=${e.target.id}&type=2`;
        else if (e.target.value === 'spectEnter')
          window.location.href = `/game?id=${e.target.id}&type=3`;
      }
    }
  };

  const handleClickStats = () => {
    window.location.href = '/stats';
  };

  const handleMakeRoom = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const createRoom = async roomInfo => {
    try {
      roomInfo['mapColor'] = colors[roomInfo['mapColor']];
      const response = await axios.post(`${res_url}/game/new`, roomInfo);
      window.location.href = `/game?id=${response.data}&username=${roomInfo.username}&type=1`;
    } catch (err) {
      console.log(err);
    }
  };

  const enterPrivateRoom = async (roomId, password, mode) => {
    try {
      const response = await axios.post(`${res_url}/game/checkRoomValidate`, {
        roomId: roomId,
        password: password,
        mode: mode
      });
      if (mode === 'selectEnter') window.location.href = `/game?id=${roomId}&type=2`;
      else if (mode === 'spectEnter') window.location.href = `/game?id=${roomId}&type=3`;
    } catch (err) {
      if (err.response.status === 400) {
        alert('비밀번호가 틀렸습니다!');
      } else if (err.response.status === 409) {
        alert('방이 꽉 찼습니다!');
      }
      console.log(err);
    }
  };

  useEffect(() => {
    getList();
  }, []);

  return (
    <div>
      <h1>게임 접속</h1>
      <button id={0} onClick={handleClick} value='fastEnter'>
        빠른 시작
      </button>
      <button onClick={handleMakeRoom}>방 만들기</button>
      {modalOpen && (
        <Modal open={modalOpen} close={closeModal} create={createRoom} header='Create Room'></Modal>
      )}
      <h1>게임 리스트</h1>
      {gameList.map((game, idx) => {
        return (
          <div key={game.roomId} style={{ display: 'flex' }}>
            {game.type === 'private' && <div>🔐</div>}
            <div style={{ margin: '3px' }}>{game.leftPlayer}</div>
            <div style={{ margin: '3px' }}>vs</div>
            <div style={{ margin: '3px' }}>
              {game.rightPlayer === 'waiting' ? '???' : game.rightPlayer}
            </div>
            <button
              id={game.roomId}
              name={idx}
              onClick={handleClick}
              value='selectEnter'
              // disabled={game.rightPlayer !== 'waiting'}
            >
              플레이어로 입장
            </button>
            <button id={game.roomId} name={idx} onClick={handleClick} value='spectEnter'>
              관전자로 입장
            </button>
          </div>
        );
      })}
      <h1>게임 전적</h1>
      <button onClick={handleClickStats}>show stats</button>
    </div>
  );
};

export default Home;
