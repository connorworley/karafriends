import "materialize-css/dist/css/materialize.css"; // tslint:disable-line:no-submodule-imports
import React, { useEffect, useState } from "react";

import Loader from "../common/components/Loader";
import "./App.css";
import Login from "./Login";
import Player from "./Player";
import QRCode from "./QRCode";

enum AppState {
  Loading,
  NotLoggedIn,
  LoggedIn,
}

function App() {
  const [appState, setAppState] = useState(AppState.Loading);

  useEffect(() => {
    window.karafriends
      .isLoggedIn()
      .then((loggedIn) =>
        setAppState(loggedIn ? AppState.LoggedIn : AppState.NotLoggedIn)
      );
  }, []);

  switch (appState) {
    case AppState.Loading:
    default:
      return (
        <div className="mainContainer">
          <Loader />
        </div>
      );
    case AppState.NotLoggedIn:
      return (
        <div className="mainContainer">
          <Login />
        </div>
      );
    case AppState.LoggedIn:
      return (
        <div className="mainContainer">
          <Player />
          <div className="inputBar">
            <QRCode />
          </div>
        </div>
      );
  }
}

export default App;
