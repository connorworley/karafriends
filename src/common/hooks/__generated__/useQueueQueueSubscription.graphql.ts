/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type useQueueQueueSubscriptionVariables = {};
export type useQueueQueueSubscriptionResponse = {
    readonly queueChanged: ReadonlyArray<{
        readonly songId: string;
        readonly timestamp: string;
    }>;
};
export type useQueueQueueSubscription = {
    readonly response: useQueueQueueSubscriptionResponse;
    readonly variables: useQueueQueueSubscriptionVariables;
};



/*
subscription useQueueQueueSubscription {
  queueChanged {
    songId
    timestamp
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "QueueItem",
    "kind": "LinkedField",
    "name": "queueChanged",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "songId",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "timestamp",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useQueueQueueSubscription",
    "selections": (v0/*: any*/),
    "type": "Subscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useQueueQueueSubscription",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "9d46e09e4e754b0945d19ef45998b389",
    "id": null,
    "metadata": {},
    "name": "useQueueQueueSubscription",
    "operationKind": "subscription",
    "text": "subscription useQueueQueueSubscription {\n  queueChanged {\n    songId\n    timestamp\n  }\n}\n"
  }
};
})();
(node as any).hash = '388741935411b52a682f455242530c1b';
export default node;
