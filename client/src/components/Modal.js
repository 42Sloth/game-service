import React, { useState } from 'react';
import '../styles/Modal.css';

const Modal = props => {
  const { open, close, create, header } = props;
  const [userInputs, setUserInputs] = useState({
    username: '',
    roomName: '',
    access: 'public',
    password: '',
    speed: 'moderate',
    ball: 0,
    mapColor: 0
  });

  const handleChange = e => {
    setUserInputs({
      ...userInputs,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={open ? 'openModal modal' : 'modal'}>
      {open ? (
        <section>
          <header>
            {header}
            <button className='close' onClick={close}>
              &times;
            </button>
          </header>
          <main>
            <h3>User name</h3>
            <input placeholder='Input User name' name='username' onChange={handleChange} />
            <h3>Room name</h3>
            <input placeholder='Input Room name' name='roomName' onChange={handleChange} />
            <h3>Access specifier</h3>
            <input
              type='radio'
              value='public'
              name='access'
              checked={userInputs['access'] === 'public'}
              onChange={handleChange}
            />
            public
            <input
              type='radio'
              value='private'
              name='access'
              checked={userInputs['access'] === 'private'}
              onChange={handleChange}
            />
            private
            {userInputs['access'] === 'private' && (
              <input type='password' maxLength='4' name='password' onChange={handleChange} />
            )}
            <h3>Speed</h3>
            <input
              type='radio'
              value='slow'
              name='speed'
              checked={userInputs['speed'] === 'slow'}
              onChange={handleChange}
            />
            slow
            <input
              type='radio'
              value='moderate'
              name='speed'
              checked={userInputs['speed'] === 'moderate'}
              onChange={handleChange}
            />
            moderate
            <input
              type='radio'
              value='fast'
              name='speed'
              checked={userInputs['speed'] === 'fast'}
              onChange={handleChange}
            />
            fast
            <h3>Ball</h3>
            <input
              type='radio'
              value={0}
              name='ball'
              checked={userInputs['ball'] == 0}
              onChange={handleChange}
            />
            🏀
            <input
              type='radio'
              value={1}
              name='ball'
              checked={userInputs['ball'] == 1}
              onChange={handleChange}
            />
            ⚽️
            <input
              type='radio'
              value={2}
              name='ball'
              checked={userInputs['ball'] == 2}
              onChange={handleChange}
            />
            🎾
            <input
              type='radio'
              value={3}
              name='ball'
              checked={userInputs['ball'] == 3}
              onChange={handleChange}
            />
            🏓
            <h3>Map color</h3>
            <input
              type='radio'
              value={0}
              name='mapColor'
              checked={userInputs['mapColor'] == 0}
              onChange={handleChange}
            />
            🟥
            <input
              type='radio'
              value={1}
              name='mapColor'
              checked={userInputs['mapColor'] == 1}
              onChange={handleChange}
            />
            🟨
            <input
              type='radio'
              value={2}
              name='mapColor'
              checked={userInputs['mapColor'] == 2}
              onChange={handleChange}
            />
            🟦
            <input
              type='radio'
              value={3}
              name='mapColor'
              checked={userInputs['mapColor'] == 3}
              onChange={handleChange}
            />
            🟩
          </main>
          <footer>
            <button className='close' onClick={() => create(userInputs)}>
              create
            </button>
            <button className='close' onClick={close}>
              close
            </button>
          </footer>
        </section>
      ) : null}
    </div>
  );
};

export default Modal;
