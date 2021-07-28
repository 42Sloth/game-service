import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Game from './pages/Game';
import Home from './pages/Home';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/game" component={Game} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
