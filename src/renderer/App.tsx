import "materialize-css/dist/css/materialize.css"; // tslint:disable-line:no-submodule-imports
import React, { useEffect, useState } from "react";

import Loader from "../common/components/Loader";
import "./App.css";
import { InputDevice } from "./audioSystem";
import Login from "./Login";
import MicrophoneSetting from "./MicrophoneSetting";
import Player from "./Player";
import QRCode from "./QRCode";

enum AppState {
  Loading,
  NotLoggedIn,
  LoggedIn,
}

function App() {
  const [appState, setAppState] = useState(AppState.Loading);
  const [mic, setMic] = useState<InputDevice | null>(null);

  useEffect(() => {
    window.karafriends
      .isLoggedIn()
      .then((loggedIn) =>
        setAppState(loggedIn ? AppState.LoggedIn : AppState.NotLoggedIn)
      );
  }, [mic]);

  switch (appState) {
    case AppState.Loading:
    default:
      return (
        <div className="container">
          <Loader />
        </div>
      );
    case AppState.NotLoggedIn:
      return (
        <div className="container">
          <Login />
        </div>
      );
    case AppState.LoggedIn:
      return (
        <div className="mainContainer">
          <Player mic={mic} />
          <div className="inputBar">
            <MicrophoneSetting cb={(name) => setMic(new InputDevice(name))} />
          </div>
        </div>
      );
  }
}

export default App;
