import M from "materialize-css";
import "materialize-css/dist/css/materialize.css"; // tslint:disable-line:no-submodule-imports
import React, { useEffect, useMemo, useState } from "react";
import { graphql, useSubscription } from "react-relay";

import Loader from "../common/components/Loader";
import { HOSTNAME } from "../common/constants";
import "./App.css";
import { InputDevice } from "./audioSystem";
import HostnameSetting from "./HostnameSetting";
import Login from "./Login";
import MicrophoneSetting from "./MicrophoneSetting";
import Player from "./Player";
import QRCode from "./QRCode";
import Queue from "./Queue";
import { AppQueueAddedSubscription } from "./__generated__/AppQueueAddedSubscription.graphql";

enum AppState {
  Loading,
  NotLoggedIn,
  LoggedIn,
}

const songAddedSubscription = graphql`
  subscription AppQueueAddedSubscription {
    queueAdded {
      ... on QueueItemInterface {
        name
        artistName
      }
    }
  }
`;

function App() {
  const [appState, setAppState] = useState(AppState.Loading);
  const [mics, setMics] = useState<InputDevice[]>([]);
  const [hostname, setHostname] = useState(HOSTNAME);

  useEffect(() => {
    window.karafriends
      .isLoggedIn()
      .then((loggedIn) =>
        setAppState(loggedIn ? AppState.LoggedIn : AppState.NotLoggedIn)
      );
  }, []);

  useSubscription<AppQueueAddedSubscription>(
    useMemo(
      () => ({
        variables: {},
        subscription: songAddedSubscription,
        onNext: (response) => {
          if (response)
            M.toast({
              html: `<h3>${response.queueAdded.name} - ${response.queueAdded.artistName}</h3>`,
            });
        },
      }),
      [songAddedSubscription]
    )
  );

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
        <div className="container valign-wrapper" style={{ height: "100%" }}>
          <Login />
        </div>
      );
    case AppState.LoggedIn:
      return (
        <div className="appMainContainer black row">
          <div className="appPlayer col s11 valign-wrapper">
            <Player mics={mics} />
          </div>
          <div className="appSidebar col s1 grey lighten-3">
            <QRCode hostname={hostname} />
            <nav className="center-align">Settings</nav>
            <div>
              <HostnameSetting onChange={setHostname} />
              {[...Array(mics.length + 1).keys()].map((i) => (
                <MicrophoneSetting
                  key={i}
                  onChange={(name, isAsio) => {
                    if (mics[i]) mics[i].stop();
                    const updatedMics = [...mics];
                    updatedMics[i] = new InputDevice(name, isAsio);
                    setMics(updatedMics);
                  }}
                  value={mics[i] ? mics[i].name : ""}
                />
              ))}
            </div>
            <nav className="center-align">Queue</nav>
            <Queue />
          </div>
        </div>
      );
  }
}

export default App;
