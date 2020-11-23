import React, { useEffect, useRef } from 'react';
import * as libqrcode from 'qrcode';

function QRCode() {
  const canvasRef: React.RefObject<HTMLCanvasElement> = useRef(null);

  useEffect(() => {
    if (!canvasRef || !canvasRef.current || !(window as any).dgram) return;
    // Trick to get the IP address of the iface we would use to access the internet
    // This address should be usable except in rare cases where LAN and WAN go through different ifaces
    const sock = (window as any).dgram.createSocket({'type': 'udp4'});
    sock.connect(1, '1.1.1.1', () => {
      const localAddr = sock.address().address;
      libqrcode.toCanvas(
        canvasRef.current,
        `https://${localAddr}:3000`,
      );
    });
  });
  return <canvas ref={canvasRef} />;
}

export default QRCode;
