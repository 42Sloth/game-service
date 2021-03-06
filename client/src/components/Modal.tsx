import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createRoom, checkUserAlreadyInRoom } from '../api/api';
import { IRoom } from '../interface/gameInterface';
import '../styles/Modal.css';

const colors: any = { 0: '#b71540', 1: '#ffda79', 2: '#0a3d62', 3: '#78e08f' };

interface ModalProps {
  open: boolean;
  close: () => void;
  header: string;
  username: string;
}

const Modal = ({ open, close, header, username }: ModalProps) => {
  const history = useHistory();
  const [userInputs, setUserInputs] = useState<IRoom>({
    // username: '',
    type: 'public',
    password: '',
    speed: 'moderate',
    ball: 'xl',
    mapColor: '0',
  });

  const handleChange = (e: any) => {
    setUserInputs({
      ...userInputs,
      [e.target.name]: e.target.value,
    });
  };

  const reqCreateRoom = async (roomInfo: IRoom) => {
    if (roomInfo.type === 'private' && roomInfo.password === '') {
      alert('비밀번호를 입력해주세요');
      return;
    }
    try {
      // roomId 유효성 검사
      // try {
      //   await checkUserAlreadyInRoom(username);
      roomInfo['mapColor'] = colors[roomInfo['mapColor']];
      const response = await createRoom(roomInfo);
      history.push(`/game`, { roomId: response.data, mode: 'createEnter', username: username });
      // } catch (err) {
      //   if (err.response.status === 406) {
      //     alert('이미 게임에 참여 중입니다');
      //   }
      // }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={open ? 'openModal modal' : 'modal'}>
      {open ? (
        <section>
          <header>
            {header}
            <button className="close" onClick={close}>
              &times;
            </button>
          </header>
          <main>
            {/* <h3>User name</h3>
            <input placeholder="Input User name" name="username" onChange={handleChange} /> */}
            <h3>Access specifier</h3>
            <input
              type="radio"
              value="public"
              name="type"
              checked={userInputs['type'] === 'public'}
              onChange={handleChange}
            />
            public
            <input
              type="radio"
              value="private"
              name="type"
              checked={userInputs['type'] === 'private'}
              onChange={handleChange}
            />
            private
            {userInputs['type'] === 'private' && (
              <input type="password" maxLength={4} name="password" onChange={handleChange} />
            )}
            <h3>Speed</h3>
            <input
              type="radio"
              value="slow"
              name="speed"
              checked={userInputs['speed'] === 'slow'}
              onChange={handleChange}
            />
            slow
            <input
              type="radio"
              value="moderate"
              name="speed"
              checked={userInputs['speed'] === 'moderate'}
              onChange={handleChange}
            />
            moderate
            <input
              type="radio"
              value="fast"
              name="speed"
              checked={userInputs['speed'] === 'fast'}
              onChange={handleChange}
            />
            fast
            <h3>Ball</h3>
            <input type="radio" value="xl" name="ball" checked={userInputs['ball'] === 'xl'} onChange={handleChange} />
            XL
            <input type="radio" value="l" name="ball" checked={userInputs['ball'] === 'l'} onChange={handleChange} />
            L
            <input type="radio" value="m" name="ball" checked={userInputs['ball'] === 'm'} onChange={handleChange} />
            M
            <input type="radio" value="s" name="ball" checked={userInputs['ball'] === 's'} onChange={handleChange} />S
            <h3>Map color</h3>
            <input
              type="radio"
              value="0"
              name="mapColor"
              checked={userInputs['mapColor'] === '0'}
              onChange={handleChange}
            />
            🟥
            <input
              type="radio"
              value="1"
              name="mapColor"
              checked={userInputs['mapColor'] === '1'}
              onChange={handleChange}
            />
            🟨
            <input
              type="radio"
              value="2"
              name="mapColor"
              checked={userInputs['mapColor'] === '2'}
              onChange={handleChange}
            />
            🟦
            <input
              type="radio"
              value="3"
              name="mapColor"
              checked={userInputs['mapColor'] === '3'}
              onChange={handleChange}
            />
            🟩
          </main>
          <footer>
            <button className="close" onClick={() => reqCreateRoom(userInputs)}>
              create
            </button>
            <button className="close" onClick={close}>
              close
            </button>
          </footer>
        </section>
      ) : null}
    </div>
  );
};

export default Modal;
