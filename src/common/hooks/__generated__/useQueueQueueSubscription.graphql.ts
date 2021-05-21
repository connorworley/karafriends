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
            readonly nameYomi: string;
            readonly artistName: string;
            readonly artistNameYomi: string;
            readonly lyricsPreview: string | null;
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
      nameYomi
      artistName
      artistNameYomi
      lyricsPreview
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
            "name": "nameYomi",
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
            "name": "artistNameYomi",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "lyricsPreview",
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
    "cacheID": "5f4aba8836c45224b1a70d5c52e20b24",
    "id": null,
    "metadata": {},
    "name": "useQueueQueueSubscription",
    "operationKind": "subscription",
    "text": "subscription useQueueQueueSubscription {\n  queueChanged {\n    song {\n      id\n      name\n      nameYomi\n      artistName\n      artistNameYomi\n      lyricsPreview\n      playtime\n    }\n    timestamp\n  }\n}\n"
  }
};
})();
(node as any).hash = '1e386ae9ce67baf755c28c736989a6b2';
export default node;
