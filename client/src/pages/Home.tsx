import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Modal from '../components/Modal';
import { getList, checkGameValidate, checkUserAlreadyInRoom, getProfile } from '../api/api';
import { IGameList } from '../interface/interface';

const Home = () => {
  const history = useHistory();
  const [gameList, setGameList] = useState<Array<IGameList>>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  let password: string | null = null;

  const reqGetList = async () => {
    try {
      const response = await getList();
      setGameList(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const reqGetUserInfo = async () => {
    try {
      const response = await getProfile();
      console.log('getProfile', response.data);
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

  const handleClickStats = () => {
    history.push('/stats');
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
    reqGetUserInfo();
  }, []);

  return (
    <div>
      <button
        onClick={() => {
          window.location.href = 'http://localhost:8000/42';
        }}
      >
        로그인
      </button>
      <button onClick={reqGetUserInfo}>get username</button>
      <h1>게임 접속</h1>
      <button id="0" onClick={handleClick} value="fastEnter">
        빠른 시작
      </button>
      <button onClick={handleMakeRoom}>방 만들기</button>
      {modalOpen && <Modal open={modalOpen} close={closeModal} header="Create Room"></Modal>}
      <h1>게임 리스트</h1>
      {gameList.map((game, idx: number) => {
        return (
          <div key={game.roomId} style={{ display: 'flex' }}>
            {game.type === 'private' && <div>🔐</div>}
            <div style={{ margin: '3px' }}>{game.leftPlayer}</div>
            <div style={{ margin: '3px' }}>vs</div>
            <div style={{ margin: '3px' }}>{game.rightPlayer === 'waiting' ? '???' : game.rightPlayer}</div>
            <button
              id={game.roomId}
              name={idx.toString()}
              onClick={handleClick}
              value="selectEnter"
              disabled={game.rightPlayer !== 'waiting'}
            >
              플레이어로 입장
            </button>
            <button id={game.roomId} name={idx.toString()} onClick={handleClick} value="spectEnter">
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
