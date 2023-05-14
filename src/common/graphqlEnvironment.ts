import { invariant } from "ts-invariant";

import {
  Environment,
  Network,
  Observable,
  RecordSource,
  RequestParameters,
  Store,
  Variables,
} from "relay-runtime";
import { createClient } from "graphql-ws";

function fetchQuery(request: RequestParameters, variables: Variables) {
  return fetch(
    window.karafriends !== undefined
      ? `http://localhost:${
          window.karafriends.karafriendsConfig().remoconPort
        }/graphql`
      : "/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: request.text,
        variables,
      }),
    }
  ).then((response) => {
    return response.json();
  });
}

function getSubscriptionUrl(): string {
  if (window.karafriends !== undefined) {
    return `ws://localhost:${
      window.karafriends.karafriendsConfig().remoconPort
    }/graphql`;
  }

  const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";

  return `${wsProtocol}://${window.location.hostname}:${window.location.port}/graphql`;
}

const subscriptionClient = createClient({ url: getSubscriptionUrl() });

const subscribe = (operation: RequestParameters, variables: Variables) => {
  return Observable.create((sink) => {
    invariant(operation.text);

    return subscriptionClient.subscribe(
      {
        operationName: operation.name,
        query: operation.text,
        variables,
      },
      sink
    );
  });
};

const environment = new Environment({
  // @ts-ignore: the relay type stubs are pitifully broken
  network: Network.create(fetchQuery, subscribe),
  store: new Store(new RecordSource()),
});

export default environment;
