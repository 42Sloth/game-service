import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import Game from './components/Game';
import Home from './components/Home';

const App: React.FC = () => {
  return (
    <BrowserRouter>
    <Switch>
      <Route path='/' exact component={Home}/>
      <Route path='/game' component={Game}/>
    </Switch>
    </BrowserRouter>
  );
}

export default App;
