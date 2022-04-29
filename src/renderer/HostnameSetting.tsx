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
        <option value={`${HOSTNAME}:8080`}>{HOSTNAME}</option>
        <option value="kara.rarelyupset.com">kara.rarelyupset.com</option>
        {window.karafriends.ipAddresses().map((address) => (
          <option value={`${address}:8080`} key={address}>
            {address}
          </option>
        ))}
      </select>
      <label>Hostname</label>
    </div>
  );
}
