import M from "materialize-css";
import React, { useEffect } from "react";

import "./global";

export default function MicrophoneSetting(props: {
  onChange: (name: string, isAsio: boolean) => void;
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
          props.onChange(dataset.name!, dataset.isAsio === "true");
        }}
      >
        <option value="" disabled={true}>
          Select a microphone
        </option>
        {window.karafriends.nativeAudio.inputDevices().map(([name, isAsio]) => (
          <option
            value={`${name}_${isAsio}`}
            data-name={name}
            data-is-asio={isAsio}
            key={`${name}_${isAsio}`}
          >
            {isAsio && "* "}
            {name}
          </option>
        ))}
      </select>
      <label>Microphone</label>
    </div>
  );
}
