/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type PlayerPopSongMutationVariables = {};
export type PlayerPopSongMutationResponse = {
    readonly popSong: {
        readonly songId: string;
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
    "name": "popSong",
    "plural": false,
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
    "cacheID": "e568eed16b13fb547e1eba0cc1c3af9d",
    "id": null,
    "metadata": {},
    "name": "PlayerPopSongMutation",
    "operationKind": "mutation",
    "text": "mutation PlayerPopSongMutation {\n  popSong {\n    songId\n    timestamp\n  }\n}\n"
  }
};
})();
(node as any).hash = '704fb4eee3b39a03112120aa73602b7a';
export default node;
