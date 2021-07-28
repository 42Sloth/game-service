import { useState } from 'react';
import '../styles/Stats.css';
import { getAllStats, getWinStats, getLoseStats, getAllGames } from '../api/api';
import { IGameStat } from '../interface/gameInterface';
import CollapsibleTable from './CollapsibleTable';
import Inputs from './Inputs';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import { Button } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1),
    },
  })
);

const Stats = () => {
  const classes = useStyles();
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
    setUserStats({
      all: 0,
      win: 0,
      lose: 0,
    });
    setUserGameHistory([]);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      getStatsCount();
      getGameHistory();
    }
  };

  return (
    <div style={{ width: '50vw', margin: 'auto', minWidth: '512px' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Inputs value={username} onChange={handleChange} onKeyPress={handleKeyPress} />
        <Button
          variant="outlined"
          color="default"
          className={classes.button}
          startIcon={<SearchIcon />}
          onClick={handleClick}
        >
          검색
        </Button>
      </div>
      {username && (
        <div className="wrapper">
          <div>총 전적: </div>
          <div>{userStats.all}전</div>
          <div>{userStats.win}승</div>
          <div>{userStats.lose}패</div>
        </div>
      )}
      {username && <CollapsibleTable userGameHistory={userGameHistory} />}
    </div>
  );
};

export default Stats;
