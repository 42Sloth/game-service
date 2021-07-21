import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import Game from './pages/Game';
import Home from './pages/Home';
import Stats from './pages/Stats';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/game" component={Game} />
        <Route path="/stats" component={Stats} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
