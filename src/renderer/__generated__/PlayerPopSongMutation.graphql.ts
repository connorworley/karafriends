/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type PlayerPopSongMutationVariables = {};
export type PlayerPopSongMutationResponse = {
    readonly popSong: ({
        readonly __typename: "DamQueueItem";
        readonly id: string;
        readonly streamingUrls: ReadonlyArray<{
            readonly url: string;
        }>;
        readonly scoringData: ReadonlyArray<number>;
        readonly timestamp: string;
        readonly streamingUrlIdx: number;
    } | {
        readonly __typename: "YoutubeQueueItem";
        readonly id: string;
        readonly timestamp: string;
    } | {
        /*This will never be '%other', but we need some
        value in case none of the concrete values match.*/
        readonly __typename: "%other";
    }) | null;
};
export type PlayerPopSongMutation = {
    readonly response: PlayerPopSongMutationResponse;
    readonly variables: PlayerPopSongMutationVariables;
};



/*
mutation PlayerPopSongMutation {
  popSong {
    __typename
    ... on DamQueueItem {
      __typename
      id
      streamingUrls {
        url
      }
      scoringData
      timestamp
      streamingUrlIdx
    }
    ... on YoutubeQueueItem {
      __typename
      id
      timestamp
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
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
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scoringData",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "timestamp",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "streamingUrlIdx",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "PlayerPopSongMutation",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "popSong",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v0/*: any*/),
              (v1/*: any*/),
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/)
            ],
            "type": "DamQueueItem",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v0/*: any*/),
              (v1/*: any*/),
              (v4/*: any*/)
            ],
            "type": "YoutubeQueueItem",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "PlayerPopSongMutation",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "popSong",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/)
            ],
            "type": "DamQueueItem",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v1/*: any*/),
              (v4/*: any*/)
            ],
            "type": "YoutubeQueueItem",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0c5dea4f94d921bb6f0002b17766b6b0",
    "id": null,
    "metadata": {},
    "name": "PlayerPopSongMutation",
    "operationKind": "mutation",
    "text": "mutation PlayerPopSongMutation {\n  popSong {\n    __typename\n    ... on DamQueueItem {\n      __typename\n      id\n      streamingUrls {\n        url\n      }\n      scoringData\n      timestamp\n      streamingUrlIdx\n    }\n    ... on YoutubeQueueItem {\n      __typename\n      id\n      timestamp\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = 'c02e32a4cb1aefeab8a40094310790a1';
export default node;
