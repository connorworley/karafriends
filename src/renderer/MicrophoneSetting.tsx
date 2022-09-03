import M from "materialize-css";
import React, { useEffect } from "react";

import { InputDevice } from "./audioSystem";
import "./global";

const MicrophoneSettingOption = ({
  name,
  channel,
}: {
  name: string;
  channel: number;
}) => (
  <option data-name={name} data-channel={channel} value={`${name}_${channel}`}>
    {`${name} (Channel ${channel})`}
  </option>
);

interface Props {
  mic: InputDevice | null;
  onChange: (mic: InputDevice) => void;
}

export default function MicrophoneSetting({ mic, onChange }: Props) {
  useEffect(() => {
    M.AutoInit();
  }, []);

  console.log(window.karafriends.nativeAudio.inputDevices());

  return (
    <div className="input-field">
      <select
        value={mic ? `${mic.name}_${mic.channelSelection}` : ""}
        onChange={(e) => {
          const dataset = e.target.options[e.target.selectedIndex].dataset;
          const newMic = new InputDevice(
            dataset.name!,
            parseInt(dataset.channel!, 10)
          );
          onChange(newMic);
        }}
      >
        <option value="" disabled={true}>
          Select a microphone
        </option>
        {window.karafriends.nativeAudio
          .inputDevices()
          .map(([name, channelCount]) =>
            [...Array(channelCount)].map((_, i) => (
              <MicrophoneSettingOption
                key={`${name}_${i}`}
                name={name}
                channel={i}
              />
            ))
          )}
      </select>
      <label>Microphone</label>
    </div>
  );
}
