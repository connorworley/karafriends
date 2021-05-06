import React, { useEffect, useState } from "react";

import "./App.css";
import Player from "./Player";
import QRCode from "./QRCode";

declare global {
  interface Window {
      karafriends: {
      hasCredentials(): Promise<boolean>;
      setCredentials(username: string, password: string): void;
      }
  }
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [creds, setCreds] = useState({ username: "", password: "" });

  useEffect(() => {
    window.karafriends.hasCredentials().then(hasCreds => setIsLoggedIn(hasCreds));
  }, []);
  
  if (isLoggedIn) {
    return (
      <div className="mainContainer">
        <Player />
        <div className="inputBar">
          <QRCode />
        </div>
      </div>
    );
  } else {  
    return (
      <div className="mainContainer">
        <form onSubmit={() => window.karafriends.setCredentials(creds.username, creds.password)}>
          <input type="text" value={creds.username} onChange={(e) => setCreds({ username: e.target.value, password: creds.password })} />
          <input type="password" value={creds.password} onChange={(e) => setCreds({ username: creds.username, password: e.target.value })} />
          <input type="submit" />
        </form>
      </div>
    );
  }
}

export default App;
