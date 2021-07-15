import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import Pong from './components/Pong';
import Home from './components/Home';

const App: React.FC = () => {
  return (
    <BrowserRouter>
    <Switch>
      <Route path='/' exact component={Home}/>
      <Route path='/game' component={Pong}/>
    </Switch>
    </BrowserRouter>
  );
}

export default App;
