import M from "materialize-css";
import React, { useEffect } from "react";

import "./global";

export default function MicrophoneSetting(props: {
  onChange: (name: string, channelSelection: number) => void;
  value: string;
}) {
  useEffect(() => {
    M.AutoInit();
  }, []);

  return (
    <div className="input-field">
      <select
        value={props.value}
        onChange={(e) => {
          const dataset = e.target.options[e.target.selectedIndex].dataset;
          props.onChange(dataset.name!, parseInt(dataset.channel!, 10));
        }}
      >
        <option value="" disabled={true}>
          Select a microphone
        </option>
        {window.karafriends.nativeAudio
          .inputDevices()
          .map(([name, channelCount]) =>
            [
              <option data-name={name} data-channel={-1} key={`${name}_${-1}`}>
                {`${name} (All Channels)`}
              </option>,
            ].concat(
              [...Array(channelCount)].map((_, i) => (
                <option data-name={name} data-channel={i} key={`${name}_${i}`}>
                  {`${name} (Channel ${i})`}
                </option>
              ))
            )
          )}
      </select>
      <label>Microphone</label>
    </div>
  );
}
