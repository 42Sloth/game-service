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
  const [password, setPassword] = useState('');

  const getList = async () => {
    try {
      const response = await axios.get(`${res_url}/game/list`);
      setGameList(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = e => {
    console.log('id', e.target.id);
    if (e.target.id === '0') window.location.href = `/game?id=${e.target.id}&type=0`;
    // else {
    //   if (e.target.value === 'selectEnter') window.location.href = `/game?id=${e.target.id}&type=2`;
    else if (e.target.value === 'spectEnter')
      window.location.href = `/game?id=${e.target.id}&type=3`;
    // }
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
      window.location.href = `/game?id=${response.data}&username=${roomInfo.username}&type=1`;
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = e => {
    setPassword(e.target.value);
  };

  const enterPrivateRoom = async e => {
    try {
      const response = await axios.post(`${res_url}/game/checkRoomValidate`, {
        roomId: e.target.id,
        password: password
      });
      window.location.href = `/game?id=${e.target.id}&type=2`;
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
      {gameList.map(game => {
        return (
          <div key={game.roomId} style={{ display: 'flex' }}>
            <div style={{ margin: '3px' }}>{game.leftPlayer}</div>
            <div style={{ margin: '3px' }}>vs</div>
            <div style={{ margin: '3px' }}>
              {game.rightPlayer === 'waiting' ? '???' : game.rightPlayer}
            </div>
            {game.rightPlayer === 'waiting' && (
              <>
                {console.log(game.type)}
                {game.type === 'private' ? (
                  <div>
                    <button id={game.roomId} value='selectEnter'>
                      플레이어로 게임에 참여하기
                    </button>
                    <input placeholder='🔒' value={password} onChange={handleChange}></input>
                    <button id={game.roomId} onClick={enterPrivateRoom}>
                      입장
                    </button>
                  </div>
                ) : (
                  <button id={game.roomId} onClick={handleClick} value='selectEnter'>
                    플레이어로 게임에 참여하기
                  </button>
                )}
              </>
            )}
            <button id={game.roomId} onClick={handleClick} value='spectEnter'>
              게임 관전하기
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
