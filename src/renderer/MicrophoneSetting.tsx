import M from "materialize-css";
import React, { useEffect } from "react";

import "./global";

export default function MicrophoneSetting(props: {
  onChange: (name: string) => void;
  value: string;
}) {
  useEffect(() => {
    M.AutoInit();
  }, []);

  return (
    <div className="input-field">
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      >
        <option value="" disabled={true}>
          Select a microphone
        </option>
        {window.karafriends.nativeAudio.inputDevices().map((name) => (
          <option value={name} key={name}>
            {name}
          </option>
        ))}
      </select>
      <label>Microphone</label>
    </div>
  );
}
