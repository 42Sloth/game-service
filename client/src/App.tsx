import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import Game from './pages/Game';
import Home from './pages/Home';
import MyPage from './pages/MyPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit', fontSize: '2rem' }}>
        42Sloth
      </Link>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/game" component={Game} />
        <Route path="/mypage" component={MyPage} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
