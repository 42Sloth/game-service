import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Modal from '../components/Modal';
import { getList, checkGameValidate, checkUserAlreadyInRoom, getProfile, logout } from '../api/api';
import { IGameList } from '../interface/gameInterface';
import { IUser } from '../interface/userInterface';
import Stats from '../components/Stats';
import GameList from '../components/GameList';
import '../styles/Home.css';

const Home = () => {
  const history = useHistory();
  const [gameList, setGameList] = useState<Array<IGameList>>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [userInfo, setUserinfo] = useState<IUser>({
    id: '',
    email: '',
    firstName: '',
    lastName: '',
    picture: '',
  });

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
      const data = response.data;
      setUserinfo({
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        picture: data.picture,
      });
    } catch (err) {
      // console.log(err);
    }
  };

  const handleClick = async (e: any) => {
    history.push(`/game`, { roomId: e.target.id, mode: e.target.value, username: userInfo.id });
  };

  const handleMakeRoom = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleLogin = () => {
    window.location.href = 'http://localhost:8000/42';
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUserinfo({
        id: '',
        email: '',
        firstName: '',
        lastName: '',
        picture: '',
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    reqGetList();
    reqGetUserInfo();
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      {userInfo.id ? (
        <div style={{ display: 'flex' }}>
          <div id="profile-wrapper">
            <img id="profile" src={userInfo.picture} alt="profile"></img>
          </div>
          <div
            style={{ height: '50px', lineHeight: '50px' }}
            onClick={() => {
              history.push('/mypage');
            }}
          >
            {userInfo.id}
          </div>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        <button onClick={handleLogin}>로그인</button>
      )}
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
        {page === 0 ? <GameList gameList={gameList} username={userInfo.id} /> : <Stats />}
      </div>
      {modalOpen && <Modal open={modalOpen} close={closeModal} header="Create Room" username={userInfo.id}></Modal>}
    </div>
  );
};

export default Home;
