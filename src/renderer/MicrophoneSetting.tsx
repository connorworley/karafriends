import M from "materialize-css";
import React, { useEffect } from "react";

import "./global";

export default function MicrophoneSetting(props: {
  cb: (name: string) => void;
}) {
  useEffect(() => {
    M.AutoInit();
  }, []);

  return (
    <div className="row s12">
      <div className="input-field">
        <select value="" onChange={(e) => props.cb(e.target.value)}>
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
    </div>
  );
}
