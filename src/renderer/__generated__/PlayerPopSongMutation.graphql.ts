/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type PlayerPopSongMutationVariables = {};
export type PlayerPopSongMutationResponse = {
    readonly popSong: {
        readonly song: {
            readonly id: string;
            readonly streamingUrls: ReadonlyArray<{
                readonly url: string;
            }>;
            readonly scoringData: ReadonlyArray<number>;
        };
        readonly timestamp: string;
        readonly streamingUrlIdx: number;
    } | null;
};
export type PlayerPopSongMutation = {
    readonly response: PlayerPopSongMutationResponse;
    readonly variables: PlayerPopSongMutationVariables;
};



/*
mutation PlayerPopSongMutation {
  popSong {
    song {
      id
      streamingUrls {
        url
      }
      scoringData
    }
    timestamp
    streamingUrlIdx
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
    "name": "popSong",
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
            "concreteType": "StreamingUrlInfo",
            "kind": "LinkedField",
            "name": "streamingUrls",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "url",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "scoringData",
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "streamingUrlIdx",
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
    "name": "PlayerPopSongMutation",
    "selections": (v0/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "PlayerPopSongMutation",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "8dba7197512f9bb801567932a5641139",
    "id": null,
    "metadata": {},
    "name": "PlayerPopSongMutation",
    "operationKind": "mutation",
    "text": "mutation PlayerPopSongMutation {\n  popSong {\n    song {\n      id\n      streamingUrls {\n        url\n      }\n      scoringData\n    }\n    timestamp\n    streamingUrlIdx\n  }\n}\n"
  }
};
})();
(node as any).hash = '3b98263ee02e5e6ffdaef7747f143f24';
export default node;
