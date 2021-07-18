import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './Modal';

const ip = process.env.REACT_APP_GAME_SERVER_IP;
const port = process.env.REACT_APP_GAME_SERVER_PORT;
const res_url = `http://${ip}:${port}`;

const colors = { 0: '#ff0000', 1: '#ffff00', 2: '#00ff00', 3: '#0000ff' };

const Home = () => {
  const [gameList, setGameList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const getList = async () => {
    try {
      const response = await axios.get(`${res_url}/game/list`);
      setGameList(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = e => {
    window.location.href = `/game?id=${e.target.id}`;
  };

  const handleClickStats = e => {
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
      window.location.href = `/game?id=1&username=${roomInfo.username}`;
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getList();
  }, []);

  return (
    <div>
      <h1>게임 접속</h1>
      <button id={0} onClick={handleClick}>
        빠른 시작
      </button>
      <button id={0} onClick={handleMakeRoom}>
        방 만들기
      </button>
      {modalOpen && (
        <Modal open={modalOpen} close={closeModal} create={createRoom} header='Create Room'></Modal>
      )}
      <h1>게임 리스트</h1>
      {gameList.map((game, idx) => {
        return (
          <div key={idx} style={{ display: 'flex' }}>
            <div style={{ margin: '3px' }}>{game.leftPlayer}</div>
            <div style={{ margin: '3px' }}>vs</div>
            <div style={{ margin: '3px' }}>{game.rightPlayer}</div>
            <button id={game.roomId} onClick={handleClick}>
              join
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
