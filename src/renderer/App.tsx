import React from "react";
import "./App.css";
import Player from "./Player";
import QRCode from "./QRCode";

function App() {
  return (
    <div className="mainContainer">
      <Player />
      <div className="inputBar">
        <QRCode />
      </div>
    </div>
  );
}

export default App;
