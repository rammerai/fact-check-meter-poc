import './App.css';
import WebSocket from './components/WebSocket'

function App() {
  return (
    <div className="App">
      <h1>Fact Checker</h1>
      <h2>Click button to allow Fact Checker to tune into your conversation.</h2>
      <button>Click Me</button>
      <WebSocket />
    </div>
  );
}

export default App;
