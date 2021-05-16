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
  const [mics, setMics] = useState<InputDevice[]>([]);

  useEffect(() => {
    window.karafriends
      .isLoggedIn()
      .then((loggedIn) =>
        setAppState(loggedIn ? AppState.LoggedIn : AppState.NotLoggedIn)
      );
  }, [mics]);

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
              <Player mics={mics} />
            </div>
            <div className="appSettings col s2">
              <nav className="center-align">Settings</nav>
              <div className="col s12">
                {[...Array(mics.length + 1).keys()].map((i) => (
                  <MicrophoneSetting
                    key={i}
                    onChange={(name) => {
                      if (mics[i]) mics[i].stop();
                      const updatedMics = [...mics];
                      updatedMics.splice(i, 1, new InputDevice(name));
                      setMics(updatedMics);
                    }}
                    value={mics[i] ? mics[i].name : ""}
                  />
                ))}
              </div>
            </div>
          </div>
          <div>
            <QRCode />
          </div>
        </div>
      );
  }
}

export default App;
