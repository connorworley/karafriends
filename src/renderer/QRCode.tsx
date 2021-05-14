import { toDataURL } from "qrcode";
import React, { useEffect, useState } from "react";

import Loader from "../common/components/Loader";
import { HOSTNAME } from "../common/constants";

function QRCode() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    toDataURL(
      `http://${HOSTNAME}:8080`,
      { errorCorrectionLevel: "L" },
      (error, url) => setImgSrc(url)
    );
  });

  if (imgSrc) {
    return <img src={imgSrc} />;
  } else {
    return <Loader />;
  }
}

export default QRCode;
