import React, { Component, Fragment } from 'react';
import './styles/App.css';
import Canvas from './canvas';

class App extends Component {
  render() {
    return (
      <Fragment>
        <div className="main">
          <div className="color-guide">
            <h5>Color Guide</h5>
            <div className="user user">User</div>
            <div className="user guest">Guest</div>
          </div>
          <Canvas />
        </div>
      </Fragment>
    );
  }
}
export default App;