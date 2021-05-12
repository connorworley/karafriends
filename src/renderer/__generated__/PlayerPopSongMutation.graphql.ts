/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type PlayerPopSongMutationVariables = {};
export type PlayerPopSongMutationResponse = {
    readonly popSong: {
        readonly id: string;
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
    id
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
        "kind": "ScalarField",
        "name": "id",
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
    "cacheID": "27a39306f5c21ffb460841e13b568c95",
    "id": null,
    "metadata": {},
    "name": "PlayerPopSongMutation",
    "operationKind": "mutation",
    "text": "mutation PlayerPopSongMutation {\n  popSong {\n    id\n    timestamp\n  }\n}\n"
  }
};
})();
(node as any).hash = '6c8a50a2cc961c14410ad24f284cf20a';
export default node;
