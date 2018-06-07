import React, { Component } from 'react';
import './utils.js';
import Auth from './Auth/Auth';
import './App.css';
import Main from './Main/Main';
import Download from './Download/Download';
import Upload from './Upload/Upload';


class App extends Component {

//render är en metod
  render() {
    return (
      <div className="App">
        <Auth/>
        <Main/>
        <Download/>
       <Upload/>
      </div>
    );
  }
}
export default App;
