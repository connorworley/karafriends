/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type useQueueQueueSubscriptionVariables = {};
export type useQueueQueueSubscriptionResponse = {
    readonly queueChanged: ReadonlyArray<{
        readonly song: {
            readonly id: string;
            readonly name: string;
            readonly artistName: string;
            readonly playtime: number | null;
        };
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
    song {
      id
      name
      artistName
      playtime
    }
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
        "concreteType": "Song",
        "kind": "LinkedField",
        "name": "song",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "playtime",
            "storageKey": null
          }
        ],
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
    "cacheID": "3936cedda4eff4ae6ddfad4ea96a2ce7",
    "id": null,
    "metadata": {},
    "name": "useQueueQueueSubscription",
    "operationKind": "subscription",
    "text": "subscription useQueueQueueSubscription {\n  queueChanged {\n    song {\n      id\n      name\n      artistName\n      playtime\n    }\n    timestamp\n  }\n}\n"
  }
};
})();
(node as any).hash = '4546379f1f0e2ebdcb79b05a20512c2c';
export default node;
