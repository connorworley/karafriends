import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import QRCode from "./QRCode";
import "./App.css";

function App() {
  const inputRef: React.RefObject<HTMLInputElement> = useRef(null);
  const videoRef: React.RefObject<HTMLVideoElement> = useRef(null);
  const [streamUrl, setStreamUrl] = useState("");

  useEffect(() => {
    if (!videoRef || !videoRef.current || !streamUrl) return;
    const hls = new Hls();
    hls.loadSource(streamUrl);
    hls.attachMedia(videoRef.current);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (videoRef && videoRef.current) videoRef.current.play();
    });
  }, [streamUrl]);

  const setStream = () => {
    if (!inputRef || !inputRef.current) return;
    setStreamUrl(inputRef.current.value);
  };

  return (
    <div className="mainContainer">
      <div className="videoContainer">
        <video className="video" ref={videoRef} autoPlay={true} />
      </div>
      <div className="inputBar">
        <input className="input" ref={inputRef} />
        <button onClick={setStream}>Set stream</button>
        <QRCode />
      </div>
    </div>
  );
}

export default App;
