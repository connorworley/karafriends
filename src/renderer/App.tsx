import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

import M from "materialize-css";
import "materialize-css/dist/css/materialize.css"; // tslint:disable-line:no-submodule-imports
import React, { useEffect, useMemo, useState } from "react";
import { graphql, useSubscription } from "react-relay";

import { HOSTNAME } from "../common/constants";
import { KuroshiroSingleton } from "../common/joysoundParser";
import "./App.css";
import { InputDevice } from "./audioSystem";
import Effects from "./Effects";
import HostnameSetting from "./HostnameSetting";
import MicrophoneSetting from "./MicrophoneSetting";
import Player from "./Player";
import QRCode from "./QRCode";
import Queue from "./Queue";
import { AppQueueAddedSubscription } from "./__generated__/AppQueueAddedSubscription.graphql";

interface SavedMic {
  name: string;
  channel: number;
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

  const kuroshiro = new Kuroshiro();
  const kuromojiAnalyzer = new KuromojiAnalyzer({ dictPath: "/dict" });
  const kuromojiPromise = kuroshiro.init(kuromojiAnalyzer);

  const kuroshiroSingleton = {
    kuroshiro,
    analyzer: kuromojiAnalyzer,
    analyzerInitPromise: kuromojiPromise,
  };

  useEffect(() => {
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

  const onChangeMic = (index: number, newMic: InputDevice) => {
    const updatedMics = [...mics];
    const oldMic = updatedMics.splice(index, 1, newMic)[0];
    if (oldMic) oldMic.stop();
    setMics(updatedMics);
  };

  const clearMics = () => {
    mics.forEach((mic) => mic.stop());
    setMics([]);
  };

  return (
    <div className="appMainContainer black row">
      <div className="appPlayer col s11 valign-wrapper">
        <Player mics={mics} kuroshiro={kuroshiroSingleton} />
        <Effects />
      </div>
      <div className="appSidebar col s1 grey lighten-3">
        <QRCode hostname={hostname} />
        <nav className="center-align">Settings</nav>
        <div className="section center-align">
          <HostnameSetting onChange={setHostname} />
          {mics.map((mic, i) => (
            <MicrophoneSetting
              key={mic.deviceId}
              onChange={onChangeMic.bind(null, i)}
              mic={mic}
            />
          ))}
          <MicrophoneSetting
            onChange={onChangeMic.bind(null, mics.length)}
            mic={null}
          />
          <button className="btn" onClick={clearMics}>
            Clear mics
          </button>
        </div>
        <nav className="center-align">Queue</nav>
        <Queue />
      </div>
    </div>
  );
}

export default App;
