/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type AppQueueAddedSubscriptionVariables = {};
export type AppQueueAddedSubscriptionResponse = {
    readonly queueAdded: {
        readonly name?: string;
        readonly artistName?: string;
    };
};
export type AppQueueAddedSubscription = {
    readonly response: AppQueueAddedSubscriptionResponse;
    readonly variables: AppQueueAddedSubscriptionVariables;
};



/*
subscription AppQueueAddedSubscription {
  queueAdded {
    __typename
    ... on QueueItemInterface {
      __isQueueItemInterface: __typename
      name
      artistName
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "artistName",
      "storageKey": null
    }
  ],
  "type": "QueueItemInterface",
  "abstractKey": "__isQueueItemInterface"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "AppQueueAddedSubscription",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "queueAdded",
        "plural": false,
        "selections": [
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Subscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "AppQueueAddedSubscription",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "queueAdded",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "42fc4540e835d4453020a93a5ad34493",
    "id": null,
    "metadata": {},
    "name": "AppQueueAddedSubscription",
    "operationKind": "subscription",
    "text": "subscription AppQueueAddedSubscription {\n  queueAdded {\n    __typename\n    ... on QueueItemInterface {\n      __isQueueItemInterface: __typename\n      name\n      artistName\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = 'f66572f51c86f248aac522f8727b01dd';
export default node;
