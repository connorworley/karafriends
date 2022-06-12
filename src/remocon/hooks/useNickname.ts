import { useEffect, useState } from "react";

const useNickname = (shouldPrompt?: boolean) => {
  const [nickname, setNickname] = useState<string>("Unknown");

  useEffect(() => {
    if (shouldPrompt) {
      while ((localStorage.getItem("nickname") || "").length === 0) {
        localStorage.setItem(
          "nickname",
          prompt("Please set your nickname:") || ""
        );
      }
    }
    setNickname(localStorage.getItem("nickname") || "Unknown");
  }, []);

  return nickname;
};

export default useNickname;
