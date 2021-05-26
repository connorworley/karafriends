/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type SongInput = {
    id: string;
    name: string;
    artistName: string;
    playtime?: number | null;
};
export type QueueButtonMutationVariables = {
    song: SongInput;
    streamingUrlIdx: number;
};
export type QueueButtonMutationResponse = {
    readonly queueSong: number;
};
export type QueueButtonMutation = {
    readonly response: QueueButtonMutationResponse;
    readonly variables: QueueButtonMutationVariables;
};



/*
mutation QueueButtonMutation(
  $song: SongInput!
  $streamingUrlIdx: Int!
) {
  queueSong(song: $song, streamingUrlIdx: $streamingUrlIdx)
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "song"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "streamingUrlIdx"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "song",
        "variableName": "song"
      },
      {
        "kind": "Variable",
        "name": "streamingUrlIdx",
        "variableName": "streamingUrlIdx"
      }
    ],
    "kind": "ScalarField",
    "name": "queueSong",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "QueueButtonMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "QueueButtonMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3330c0b3b5e2254bdd23539db6a4a521",
    "id": null,
    "metadata": {},
    "name": "QueueButtonMutation",
    "operationKind": "mutation",
    "text": "mutation QueueButtonMutation(\n  $song: SongInput!\n  $streamingUrlIdx: Int!\n) {\n  queueSong(song: $song, streamingUrlIdx: $streamingUrlIdx)\n}\n"
  }
};
})();
(node as any).hash = '69e52b84ab77cf02a8eea26dfd350422';
export default node;
