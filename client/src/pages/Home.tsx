import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Modal from '../components/Modal';
import { getList, checkGameValidate, checkUserAlreadyInRoom } from '../api/api';
import { IGameList } from '../interface/interface';
import Stats from '../components/Stats';
import GameList from '../components/GameList';

const Home = () => {
  const history = useHistory();
  const [gameList, setGameList] = useState<Array<IGameList>>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);

  let password: string | null = null;

  const reqGetList = async () => {
    try {
      const response = await getList();
      setGameList(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = async (e: any) => {
    const roomId = e.target.id;
    const mode = e.target.value;
    if (roomId === '0') history.push(`/game`, { roomId: roomId, mode: mode });
    else {
      if (gameList[e.target.name].type === 'private') {
        password = window.prompt('4자리 비밀번호를 입력해주세요');
        if (password) {
          reqEnter(roomId, password, mode);
        }
      } else {
        if (mode === 'selectEnter') {
          // roomId 유효성 검사
          // try {
          //   await checkUserAlreadyInRoom(username);
          history.push(`/game`, { roomId: roomId, mode: mode });
          // } catch (err) {
          //   if (err.response.status === 406) {
          //     alert('이미 게임에 참여 중입니다');
          //   }
          // }
        } else if (mode === 'spectEnter') history.push(`/game`, { roomId: roomId, mode: mode });
      }
    }
  };

  const handleMakeRoom = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const reqEnter = async (roomId: string, password: string, mode: string) => {
    try {
      await checkGameValidate({ roomId: roomId, password: password, mode: mode });
      if (mode === 'selectEnter') history.push(`/game`, { roomId: roomId, mode: mode });
      else if (mode === 'spectEnter') history.push(`/game`, { roomId: roomId, mode: mode });
    } catch (err) {
      if (err.response.status === 400) {
        alert('비밀번호가 틀렸습니다!');
      } else if (err.response.status === 409) {
        alert('방이 꽉 찼습니다!');
      }
    }
  };

  useEffect(() => {
    reqGetList();
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>게임 접속</h2>
      <button id="0" onClick={handleClick} value="fastEnter">
        Quick Start
      </button>
      <button onClick={handleMakeRoom}>Create Room</button>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <h2 onClick={() => setPage(0)}>List</h2>
          <h2 onClick={() => setPage(1)}>Stats</h2>
        </div>
        {page === 0 ? <GameList gameList={gameList} /> : <Stats />}
      </div>
      {modalOpen && <Modal open={modalOpen} close={closeModal} header="Create Room"></Modal>}
    </div>
  );
};

export default Home;
