import './App.css';
import {
  BrowserRouter,
  Switch,
  Route
} from "react-router-dom";
import { ValidationForm } from "./components/ValidationForm";

function App() {
  return (    
    <BrowserRouter>
      <Switch>
        <Route exact path="/" >
          <Home />
        </Route>
        <Route exact path="/validator">
          <ValidationForm action={'COVID-19-508'} />
        </Route>
      </Switch>
      </BrowserRouter>
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
