import { useEffect, useState } from "react";
import { fetchQuery, graphql, requestSubscription } from "react-relay";
import Song from "../../remocon/Song";

import environment from "../graphqlEnvironment";
import { useQueueQueueQuery } from "./__generated__/useQueueQueueQuery.graphql";
import { useQueueQueueSubscription } from "./__generated__/useQueueQueueSubscription.graphql";

type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ElementType // tslint:disable-line:no-shadowed-variable
>
  ? ElementType
  : never;

const queueQuery = graphql`
  query useQueueQueueQuery {
    queue {
      ... on QueueItemInterface {
        __typename
        songId
        name
        artistName
        playtime
        timestamp
        nickname
      }
    }
  }
`;

const queueSubscription = graphql`
  subscription useQueueQueueSubscription {
    queueChanged {
      ... on QueueItemInterface {
        __typename
        songId
        name
        artistName
        playtime
        timestamp
        nickname
      }
    }
  }
`;

type StateType = useQueueQueueQuery["response"]["queue"];

function withETAs(queue: StateType) {
  const result = queue.reduce<[[ElementType<StateType>, number][], number]>(
    ([results, totalETA], cur) => {
      const playtime = cur.playtime || 0;
      return [
        results.concat([[cur, totalETA + playtime]]),
        totalETA + playtime,
      ];
    },
    [[], 0]
  );
  return result[0];
}

export default function useQueue() {
  const [queueState, setQueueState] = useState<
    [ElementType<StateType>, number][]
  >([]);

  useEffect(() => {
    const initialQuery = fetchQuery<useQueueQueueQuery>(
      environment,
      queueQuery,
      {}
    )
      // @ts-ignore: @types/react-relay has wrong return type for fetchQuery
      .subscribe({
        next: ({ queue }: useQueueQueueQuery["response"]) =>
          setQueueState(withETAs(queue)),
      });

    const subscription = requestSubscription<useQueueQueueSubscription>(
      environment,
      {
        subscription: queueSubscription,
        variables: {},
        onNext: (response) => {
          if (response) setQueueState(withETAs(response.queueChanged));
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
