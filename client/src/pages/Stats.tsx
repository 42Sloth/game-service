import { useState } from 'react';
import '../styles/Stats.css';
import { getAllStats, getWinStats, getLoseStats, getAllGames } from '../api/api';
import { IGameStat } from '../interface/interface';

const Stats = () => {
  const [username, setUsername] = useState<string>('');
  const [userStats, setUserStats] = useState({
    all: 0,
    win: 0,
    lose: 0,
  });

  const [userGameHistory, setUserGameHistory] = useState<Array<IGameStat>>([]);

  const getStatsCount = async () => {
    try {
      const all_res = await getAllStats(username);
      try {
        const win_res = await getWinStats(username);
        try {
          const lose_res = await getLoseStats(username);
          setUserStats({
            all: all_res.data,
            win: win_res.data,
            lose: lose_res.data,
          });
        } catch (err) {
          console.log(err);
        }
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getGameHistory = async () => {
    try {
      const response = await getAllGames(username);
      setUserGameHistory(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = () => {
    getStatsCount();
    getGameHistory();
  };

  const handleChange = (e: any) => {
    setUsername(e.target.value);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      getStatsCount();
      getGameHistory();
    }
  };

  return (
    <div>
      <div>
        <input
          value={username}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Input username"
        ></input>
        <button onClick={handleClick}>검색</button>
      </div>
      <div className="wrapper">
        <div>총 전적: </div>
        <div>{userStats.all}전</div>
        <div>{userStats.win}승</div>
        <div>{userStats.lose}패</div>
      </div>
      {userGameHistory.map((game) => {
        const { id, playerLeft, playerRight, winner, playerLeftScore, playerRightScore, playTime } = game;
        return (
          <div key={id} className="wrapper">
            <div>{playerLeft}/</div>
            <div>{playerRight}/</div>
            <div>{playerLeftScore}/</div>
            <div>{playerRightScore}/</div>
            <div>{winner}/</div>
            <div>{playTime}초</div>
          </div>
        );
      })}
    </div>
  );
};

export default Stats;
