import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { initRecording, stopRecording } from './speech-util';

class App extends Component {
  state = {
    recording: false,
  };

  onStart() {
    this.setState({ recording: true });
    initRecording();
  }
  
  onStop() {
    this.setState({ recording: false });
    stopRecording();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <div class="button-wrapper">
            <button onClick={() => this.onStart()} disabled={this.state.recording}>Start</button>
            <button onClick={() => this.onStop()} disabled={!this.state.recording}>Stop</button>
          </div>
        </header>
      </div>
    );
  }
}

export default App;
