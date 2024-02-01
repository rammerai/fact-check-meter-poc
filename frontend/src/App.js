import React, { useState } from 'react';
import './App.css';
import WebSocket from './components/WebSocket'

function App() {

  return (
    <div className="App">
      <h1>Fact Check Meter</h1>
      <WebSocket />
    </div>
  );
}

export default App;
