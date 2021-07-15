import { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [list, setList] = useState([]);

  const getList = async () => {
    try {
      const response = await axios.get('http://localhost:3000/pong/list');
      setList(response.data);
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
      {list.map((ele, idx) => {
        return (
          <div key={idx}>
            {ele}
            <button id={ele} onClick={handleClick}>
              join
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Home;
