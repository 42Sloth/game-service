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
  const [password, setPassword] = useState({});
  const [pwIsVerified, setPwIsVerified] = useState({});

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
    else {
      if (e.target.value === 'selectEnter') window.location.href = `/game?id=${e.target.id}&type=2`;
      else if (e.target.value === 'spectEnter')
        window.location.href = `/game?id=${e.target.id}&type=3`;
    }
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
    setPassword({ [e.target.id]: e.target.value });
  };

  const enterPrivateRoom = async e => {
    try {
      const response = await axios.post(`${res_url}/game/checkRoomValidate`, {
        roomId: e.target.id,
        password: password[e.target.id]
      });
      // window.location.href = `/game?id=${e.target.id}&type=2`;
      setPwIsVerified({ ...pwIsVerified, [e.target.id]: true });
    } catch (err) {
      if (err.response.status === 400) {
        alert('비밀번호가 틀렸습니다!');
        setPwIsVerified({ ...pwIsVerified, [e.target.id]: false });
      } else if (err.response.status === 409) {
        // alert('방이 꽉 찼습니다!');
        setPwIsVerified({ ...pwIsVerified, [e.target.id]: true });
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
            {game.type === 'private' && <div>🔐</div>}
            <div style={{ margin: '3px' }}>{game.leftPlayer}</div>
            <div style={{ margin: '3px' }}>vs</div>
            <div style={{ margin: '3px' }}>
              {game.rightPlayer === 'waiting' ? '???' : game.rightPlayer}
            </div>
            {game.type === 'private' && (
              <div>
                <input
                  id={game.roomId}
                  placeholder='4자리 비밀번호 입력하세요'
                  value={password[game.roomId]}
                  onChange={handleChange}
                ></input>
                <button id={game.roomId} onClick={enterPrivateRoom}>
                  비밀번호 검증
                </button>
              </div>
            )}
            <button
              id={game.roomId}
              onClick={handleClick}
              value='selectEnter'
              disabled={
                game.rightPlayer !== 'waiting' ||
                (game.type === 'private' && !pwIsVerified[game.roomId])
              }
            >
              플레이어로 입장
            </button>
            <button
              id={game.roomId}
              onClick={handleClick}
              value='spectEnter'
              disabled={game.type === 'private' && !pwIsVerified[game.roomId]}
            >
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
