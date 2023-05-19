import React, { useEffect } from "react";
import { graphql, requestSubscription } from "react-relay";

import environment from "../common/graphqlEnvironment";
import "./Effects.css";
import { EffectsEmoteSubscription } from "./__generated__/EffectsEmoteSubscription.graphql";

const effectsEmoteSubscription = graphql`
  subscription EffectsEmoteSubscription {
    emote {
      emote
    }
  }
`;

const Effects = () => {
  useEffect(() => {
    const effectsDiv = document.getElementById("effects");
    const subscription = requestSubscription<EffectsEmoteSubscription>(
      environment,
      {
        subscription: effectsEmoteSubscription,
        variables: {},
        onNext: (response) => {
          if (!effectsDiv || !response?.emote) return;
          const emoteDiv = document.createElement("div");
          emoteDiv.textContent = response.emote.emote;
          emoteDiv.style.left = `${Math.random() * 70 + 10}%`;
          effectsDiv.appendChild(emoteDiv);
          setTimeout(() => effectsDiv.removeChild(emoteDiv), 1000);
        },
      }
    );
    return () => subscription.dispose();
  }, []);
  return <div id="effects" />;
};

export default Effects;
