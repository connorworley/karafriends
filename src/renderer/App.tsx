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
  const [mic1, setMic1] = useState<InputDevice | null>(null);
  const [mic2, setMic2] = useState<InputDevice | null>(null);

  useEffect(() => {
    window.karafriends
      .isLoggedIn()
      .then((loggedIn) =>
        setAppState(loggedIn ? AppState.LoggedIn : AppState.NotLoggedIn)
      );
  }, [mic1, mic2]);

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
        <div className="appMainContainer grey lighten-3">
          <div className="row">
            <div className="appPlayer col s10">
              <Player mic={mic1} />
            </div>
            <div className="appSettings col s2">
              <nav className="center-align">Settings</nav>
              <div className="col s12">
                <MicrophoneSetting
                  cb={(name) => setMic1(new InputDevice(name))}
                />
                <MicrophoneSetting
                  cb={(name) => setMic2(new InputDevice(name))}
                />
              </div>
            </div>
          </div>
          <div>a</div>
        </div>
      );
  }
}

export default App;
