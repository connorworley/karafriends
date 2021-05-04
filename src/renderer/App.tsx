import React from "react";
import Player from "./Player";
import QRCode from "./QRCode";
import "./App.css";

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
