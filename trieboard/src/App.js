import logo from './logo.svg';
import './App.css';
import ForceGraph from './Components/ForceGraph';
import * as d3 from "d3"

function App() {

  return (
    <div className="App" style={{"width": "100vw", "height": "100vh"}}>
      <ForceGraph/>
    </div>
  );
}

export default App;
