import { toCanvas } from "qrcode";
import React, { useEffect, useRef } from "react";

import "./QRCode.css";

function QRCode(props: { hostname: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    function update() {
      if (!canvasRef.current) return;
      console.log("update", canvasRef.current.clientWidth);
      canvasRef.current.style.width = "100%";
      toCanvas(
        canvasRef.current,
        `http://${props.hostname}`,
        {
          errorCorrectionLevel: "L",
          width: canvasRef.current.clientWidth,
        },
        (error) => {
          if (error) {
            console.error(error);
          }
        }
      );
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  });

  return <canvas ref={canvasRef} className="qrcode" />;
}

export default QRCode;
