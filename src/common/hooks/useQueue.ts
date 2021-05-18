import { useEffect, useState } from "react";
import { fetchQuery, graphql, requestSubscription } from "react-relay";

import environment from "../graphqlEnvironment";
import { useQueueQueueQuery } from "./__generated__/useQueueQueueQuery.graphql";
import { useQueueQueueSubscription } from "./__generated__/useQueueQueueSubscription.graphql";

const queueQuery = graphql`
  query useQueueQueueQuery {
    queue {
      song {
        id
        name
        nameYomi
        artistName
        artistNameYomi
        lyricsPreview
      }
      timestamp
    }
  }
`;

const queueSubscription = graphql`
  subscription useQueueQueueSubscription {
    queueChanged {
      song {
        id
        name
        nameYomi
        artistName
        artistNameYomi
        lyricsPreview
      }
      timestamp
    }
  }
`;

type StateType = useQueueQueueQuery["response"]["queue"];

export default function useQueue() {
  const [queueState, setQueueState] = useState<StateType>([]);

  useEffect(() => {
    const initialQuery = fetchQuery<useQueueQueueQuery>(
      environment,
      queueQuery,
      {}
    )
      // @ts-ignore: @types/react-relay has wrong return type for fetchQuery
      .subscribe({
        next: ({ queue }: useQueueQueueQuery["response"]) =>
          setQueueState(queue),
      });

    const subscription = requestSubscription<useQueueQueueSubscription>(
      environment,
      {
        subscription: queueSubscription,
        variables: {},
        onNext: (
          response: useQueueQueueSubscription["response"] | null | undefined
        ) => {
          if (response) setQueueState(response.queueChanged);
        },
      }
    );

    return () => {
      initialQuery.unsubscribe();
      subscription.dispose();
    };
  }, []);

  return queueState;
}
