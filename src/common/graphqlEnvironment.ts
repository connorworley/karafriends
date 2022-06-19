import {
  Environment,
  GraphQLResponse,
  Network,
  Observable,
  RecordSource,
  RequestParameters,
  Store,
  Variables,
} from "relay-runtime";
import { SubscriptionClient } from "subscriptions-transport-ws";

import karafriendsConfig from "../common/config";

function fetchQuery(request: RequestParameters, variables: Variables) {
  return fetch(
    window.location.hostname === "localhost" ||
      window.location.protocol === "file:"
      ? `http://localhost:${karafriendsConfig.remoconPort}/graphql`
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

const subscriptionClient = new SubscriptionClient(
  window.location.hostname === "localhost" ||
  window.location.protocol === "file:"
    ? `ws://localhost:${karafriendsConfig.remoconPort}/subscriptions`
    : `${window.location.protocol === "https:" ? "wss" : "ws"}://${
        window.location.hostname
      }:${window.location.port}/subscriptions`,
  {
    reconnect: true,
  }
);

function subscribe(request: RequestParameters, variables: Variables) {
  const subscribeObservable = subscriptionClient.request({
    query: request.text || undefined,
    operationName: request.name,
    variables,
  });
  // Important: Convert subscriptions-transport-ws observable type to Relay's
  // @ts-ignore: the relay type stubs are pitifully broken
  return Observable.from(subscribeObservable);
}

const environment = new Environment({
  // @ts-ignore: the relay type stubs are pitifully broken
  network: Network.create(fetchQuery, subscribe),
  store: new Store(new RecordSource()),
});

export default environment;
