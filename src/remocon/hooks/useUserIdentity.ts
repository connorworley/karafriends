import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const useUserIdentity = (shouldPrompt?: boolean) => {
  const [deviceId, setDeviceId] = useState<string>("Unknown");
  const [nickname, setNickname] = useState<string>("Unknown");

  useEffect(() => {
    if (!localStorage.getItem("deviceId")) {
      localStorage.setItem("deviceId", uuidv4());
    }

    if (shouldPrompt) {
      while ((localStorage.getItem("nickname") || "").length === 0) {
        localStorage.setItem(
          "nickname",
          prompt("Please set your nickname:") || ""
        );
      }
    }

    setDeviceId(localStorage.getItem("deviceId") || "Unknown");
    setNickname(localStorage.getItem("nickname") || "Unknown");
  }, []);

  return { nickname, deviceId };
};

export default useUserIdentity;
