import { useEffect, useState } from "react";
import { fetchQuery, graphql, requestSubscription } from "react-relay";

import environment from "../graphqlEnvironment";
import QueueItem from "../types/QueueItem";
import { useQueueQueueQuery } from "./__generated__/useQueueQueueQuery.graphql";
import { useQueueQueueSubscription } from "./__generated__/useQueueQueueSubscription.graphql";

const queueQuery = graphql`
  query useQueueQueueQuery {
    queue {
      songId
      timestamp
    }
  }
`;

const queueSubscription = graphql`
  subscription useQueueQueueSubscription {
    queueChanged {
      songId
      timestamp
    }
  }
`;

export default function useQueue() {
  const [queueState, setQueueState] = useState<readonly QueueItem[]>([]);

  useEffect(() => {
    const initialQuery = fetchQuery<useQueueQueueQuery>(
      environment,
      queueQuery,
      {}
    )
      // @ts-ignore: @types/react-relay has wrong return type for fetchQuery
      .subscribe({
        next: ({ queue }: useQueueQueueQuery["response"]) => setQueueState(queue),
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
