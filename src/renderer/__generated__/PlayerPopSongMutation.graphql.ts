/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type PlayerPopSongMutationVariables = {};
export type PlayerPopSongMutationResponse = {
    readonly popSong: {
        readonly song: {
            readonly id: string;
        };
        readonly timestamp: string;
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
    "cacheID": "197d24689f7a766769638405764a848d",
    "id": null,
    "metadata": {},
    "name": "PlayerPopSongMutation",
    "operationKind": "mutation",
    "text": "mutation PlayerPopSongMutation {\n  popSong {\n    song {\n      id\n    }\n    timestamp\n  }\n}\n"
  }
};
})();
(node as any).hash = '235ef885c5af5ccdea3cf66cd89da836';
export default node;
