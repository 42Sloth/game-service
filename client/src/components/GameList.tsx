import { IGameList } from '../interface/gameInterface';
import { useHistory } from 'react-router-dom';
import { checkGameValidate } from '../api/api';
import SimpleCard from './Simplecard';

const GameList = (props: { gameList: IGameList[]; username: string }) => {
  const history = useHistory();

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

  const handleClick = async (e: any) => {
    const roomId = e.target.id;
    const mode = e.target.value;
    let password: string | null = '';

    if (props.gameList[e.target.name].type === 'private') {
      password = window.prompt('4자리 비밀번호를 입력해주세요');
      if (password) {
        reqEnter(roomId, password, mode);
      }
    } else {
      if (mode === 'selectEnter') {
        // roomId 유효성 검사
        // try {
        //   await checkUserAlreadyInRoom(username);
        history.push(`/game`, { roomId: roomId, mode: mode, username: props.username });
        // } catch (err) {
        //   if (err.response.status === 406) {
        //     alert('이미 게임에 참여 중입니다');
        //   }
        // }
      } else if (mode === 'spectEnter') history.push(`/game`, { roomId: roomId, mode: mode });
    }
  };

  return (
    <div style={{ width: '50vw', margin: 'auto', minWidth: '512px' }}>
      {props.gameList.length === 0 ? (
        <div style={{ color: 'grey' }}>No Game</div>
      ) : (
        props.gameList.map((game, idx: number) => {
          return <SimpleCard game={game} idx={idx} handleClick={handleClick} />;
        })
      )}
    </div>
  );
};

export default GameList;
