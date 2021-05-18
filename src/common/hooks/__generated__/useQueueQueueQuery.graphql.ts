/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type useQueueQueueQueryVariables = {};
export type useQueueQueueQueryResponse = {
    readonly queue: ReadonlyArray<{
        readonly song: {
            readonly id: string;
            readonly name: string;
            readonly nameYomi: string;
            readonly artistName: string;
            readonly artistNameYomi: string;
            readonly lyricsPreview: string | null;
        };
        readonly timestamp: string;
    }>;
};
export type useQueueQueueQuery = {
    readonly response: useQueueQueueQueryResponse;
    readonly variables: useQueueQueueQueryVariables;
};



/*
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
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "QueueItem",
    "kind": "LinkedField",
    "name": "queue",
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
    "name": "useQueueQueueQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useQueueQueueQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "3534e36dd3629f260d8271d2c7ae3fe6",
    "id": null,
    "metadata": {},
    "name": "useQueueQueueQuery",
    "operationKind": "query",
    "text": "query useQueueQueueQuery {\n  queue {\n    song {\n      id\n      name\n      nameYomi\n      artistName\n      artistNameYomi\n      lyricsPreview\n    }\n    timestamp\n  }\n}\n"
  }
};
})();
(node as any).hash = '8f1d0eb3bd06000ca1d8e890dddbc21c';
export default node;
