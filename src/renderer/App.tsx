import M from "materialize-css";
import "materialize-css/dist/css/materialize.css"; // tslint:disable-line:no-submodule-imports
import React, { useEffect, useMemo, useState } from "react";
import { graphql, useSubscription } from "react-relay";

import Loader from "../common/components/Loader";
import { HOSTNAME } from "../common/constants";
import "./App.css";
import { InputDevice } from "./audioSystem";
import Effects from "./Effects";
import HostnameSetting from "./HostnameSetting";
import Login from "./Login";
import MicrophoneSetting from "./MicrophoneSetting";
import Player from "./Player";
import QRCode from "./QRCode";
import Queue from "./Queue";
import { AppQueueAddedSubscription } from "./__generated__/AppQueueAddedSubscription.graphql";

interface SavedMic {
  name: string;
  channel: number;
}

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
  const [mics, _setMics] = useState<InputDevice[]>([]);
  const [hostname, setHostname] = useState(HOSTNAME);

  const setMics = (newMics: InputDevice[]) => {
    const micsToSave = newMics.map((mic) => ({
      name: mic.name,
      channel: mic.channelSelection,
    }));
    localStorage.setItem("mics", JSON.stringify(micsToSave));
    _setMics(newMics);
  };

  useEffect(() => {
    window.karafriends
      .isLoggedIn()
      .then((loggedIn) =>
        setAppState(loggedIn ? AppState.LoggedIn : AppState.NotLoggedIn)
      );

    const savedMicInfo = JSON.parse(localStorage.getItem("mics") || "[]");
    const inputDevices = window.karafriends.nativeAudio.inputDevices();
    const channelCounts: { [key: string]: number } = inputDevices.reduce(
      (acc, cur) => ({
        ...acc,
        [cur[0]]: cur[1],
      }),
      {}
    );
    const savedMics = savedMicInfo
      .filter(
        ({ name, channel }: SavedMic) =>
          name in channelCounts && channel < channelCounts[name]
      )
      .map(({ name, channel }: SavedMic) => new InputDevice(name, channel));
    setMics(savedMics);
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
            <Effects />
          </div>
          <div className="appSidebar col s1 grey lighten-3">
            <QRCode hostname={hostname} />
            <nav className="center-align">Settings</nav>
            <div>
              <HostnameSetting onChange={setHostname} />
              {[...Array(mics.length + 1).keys()].map((i) => (
                <MicrophoneSetting
                  key={i}
                  onChange={(name, channel) => {
                    if (mics[i]) mics[i].stop();
                    const updatedMics = [...mics];
                    updatedMics[i] = new InputDevice(name, channel);
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
