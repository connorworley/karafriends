import M from "materialize-css";
import React, { useEffect } from "react";

import { HOSTNAME } from "../common/constants";
import "./global";

export default function HostnameSetting(props: {
  onChange: (name: string) => void;
}) {
  useEffect(() => {
    M.AutoInit();
  }, []);

  return (
    <div className="input-field">
      <select value={HOSTNAME} onChange={(e) => props.onChange(e.target.value)}>
        <option value={HOSTNAME}>{HOSTNAME}</option>
        {window.karafriends.ipAddresses().map((address) => (
          <option value={address} key={address}>
            {address}
          </option>
        ))}
      </select>
      <label>Hostname</label>
    </div>
  );
}
