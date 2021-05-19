import M from "materialize-css";
import "materialize-css/dist/css/materialize.css"; // tslint:disable-line:no-submodule-imports
import React, { useEffect, useMemo, useState } from "react";
import { graphql, useSubscription } from "react-relay";

import Loader from "../common/components/Loader";
import "./App.css";
import { InputDevice } from "./audioSystem";
import Login from "./Login";
import MicrophoneSetting from "./MicrophoneSetting";
import Player from "./Player";
import QRCode from "./QRCode";
import { AppQueueAddedSubscription } from "./__generated__/AppQueueAddedSubscription.graphql";

enum AppState {
  Loading,
  NotLoggedIn,
  LoggedIn,
}

const songAddedSubscription = graphql`
  subscription AppQueueAddedSubscription {
    queueAdded {
      song {
        name
        artistName
      }
    }
  }
`;

function App() {
  const [appState, setAppState] = useState(AppState.Loading);
  const [mics, setMics] = useState<InputDevice[]>([]);

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
              html: `${response.queueAdded.song.name}<br/>${response.queueAdded.song.artistName}`,
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
                      updatedMics[i] = new InputDevice(name);
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
