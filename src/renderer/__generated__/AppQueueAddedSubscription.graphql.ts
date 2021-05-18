/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type AppQueueAddedSubscriptionVariables = {};
export type AppQueueAddedSubscriptionResponse = {
    readonly queueAdded: {
        readonly song: {
            readonly name: string;
            readonly artistName: string;
        };
    };
};
export type AppQueueAddedSubscription = {
    readonly response: AppQueueAddedSubscriptionResponse;
    readonly variables: AppQueueAddedSubscriptionVariables;
};



/*
subscription AppQueueAddedSubscription {
  queueAdded {
    song {
      name
      artistName
      id
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "artistName",
  "storageKey": null
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
        "concreteType": "QueueItem",
        "kind": "LinkedField",
        "name": "queueAdded",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Song",
            "kind": "LinkedField",
            "name": "song",
            "plural": false,
            "selections": [
              (v0/*: any*/),
              (v1/*: any*/)
            ],
            "storageKey": null
          }
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
        "concreteType": "QueueItem",
        "kind": "LinkedField",
        "name": "queueAdded",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Song",
            "kind": "LinkedField",
            "name": "song",
            "plural": false,
            "selections": [
              (v0/*: any*/),
              (v1/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c838fc82c59e9c68f5e3787cdaa23782",
    "id": null,
    "metadata": {},
    "name": "AppQueueAddedSubscription",
    "operationKind": "subscription",
    "text": "subscription AppQueueAddedSubscription {\n  queueAdded {\n    song {\n      name\n      artistName\n      id\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = 'ec1d3cb33f02ba652a88a9899082992f';
export default node;
