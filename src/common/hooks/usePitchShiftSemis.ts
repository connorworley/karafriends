import { useEffect, useState } from "react";
import {
  fetchQuery,
  graphql,
  requestSubscription,
  useMutation,
} from "react-relay";

import environment from "../graphqlEnvironment";
import { usePitchShiftSemisMutation } from "./__generated__/usePitchShiftSemisMutation.graphql";
import { usePitchShiftSemisQuery } from "./__generated__/usePitchShiftSemisQuery.graphql";
import { usePitchShiftSemisSubscription } from "./__generated__/usePitchShiftSemisSubscription.graphql";

const pitchShiftSemisQuery = graphql`
  query usePitchShiftSemisQuery {
    pitchShiftSemis
  }
`;

const pitchShiftSemisMutation = graphql`
  mutation usePitchShiftSemisMutation($semis: Int!) {
    setPitchShiftSemis(semis: $semis)
  }
`;

const pitchShiftSemisSubscription = graphql`
  subscription usePitchShiftSemisSubscription {
    pitchShiftSemisChanged
  }
`;

type StateType = usePitchShiftSemisQuery["response"]["pitchShiftSemis"];

export default function usePitchShiftSemis() {
  const [pitchShiftSemis, setLocalPitchShiftSemis] = useState<StateType>(0);
  const [commit] = useMutation<usePitchShiftSemisMutation>(
    pitchShiftSemisMutation
  );

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        return;
      }

      fetchQuery<usePitchShiftSemisQuery>(
        environment,
        pitchShiftSemisQuery,
        {}
      ).subscribe({
        next: (response: usePitchShiftSemisQuery["response"]) =>
          setLocalPitchShiftSemis(response.pitchShiftSemis),
      });
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const initialQuery = fetchQuery<usePitchShiftSemisQuery>(
      environment,
      pitchShiftSemisQuery,
      {}
    ).subscribe({
      next: (response: usePitchShiftSemisQuery["response"]) =>
        setLocalPitchShiftSemis(response.pitchShiftSemis),
    });

    const subscription = requestSubscription<usePitchShiftSemisSubscription>(
      environment,
      {
        subscription: pitchShiftSemisSubscription,
        variables: {},
        onNext: (response) => {
          if (response)
            setLocalPitchShiftSemis(response.pitchShiftSemisChanged);
        },
      }
    );

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      initialQuery.unsubscribe();
      subscription.dispose();
    };
  }, []);

  const setPitchShiftSemis = (semis: StateType) => {
    setLocalPitchShiftSemis(semis);
    commit({ variables: { semis: semis } });
  };

  return { pitchShiftSemis, setPitchShiftSemis };
}
