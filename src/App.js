import './App.css';
import {
  BrowserRouter,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { ValidationForm } from "./components/ValidationForm";

function App() {
  return (    
    <div className="App">
      <BrowserRouter basename="shc-web-verifier">
        <nav >
          <ul>
            <li><Link to="/" className="nav-link">Home</Link></li>
            <li><Link to="/validator" className="nav-link">Validator</Link></li>
          </ul>
        </nav>
        <Switch>
          <Route exact path="/" >
            <Home />
          </Route>
          <Route exact path="/validator">
            <ValidationForm action={'COVID-19-508'} />
          </Route>
        </Switch>
        </BrowserRouter>
      </div>
  );
}

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>SMART Health Cards Web Verifier</h1>
      </header>
    </div>
  );
}

export default App;
