import { useEffect, useState } from 'react';
import axios from 'axios';

const ip = process.env.REACT_APP_GAME_SERVER_IP;
const port = process.env.REACT_APP_GAME_SERVER_PORT;

const Home = () => {
  const [gameList, setGameList] = useState([]);

  const getList = async () => {
    try {
      const response = await axios.get(`http://${ip}:${port}/pong/list`);
      setGameList(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = e => {
    window.location.href = `/game?id=${e.target.id}`;
  };

  useEffect(() => {
    getList();
  }, []);

  return (
    <div>
      <h1>게임 접속</h1>
      <button id={0} onClick={handleClick}>
        click
      </button>
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
    </div>
  );
};

export default Home;
