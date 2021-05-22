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
    streamingUrl: string;
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
  $streamingUrl: String!
) {
  queueSong(song: $song, streamingUrl: $streamingUrl)
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
    "name": "streamingUrl"
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
        "name": "streamingUrl",
        "variableName": "streamingUrl"
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
    "cacheID": "69bc63b15213f592d631ef315cf59dc8",
    "id": null,
    "metadata": {},
    "name": "QueueButtonMutation",
    "operationKind": "mutation",
    "text": "mutation QueueButtonMutation(\n  $song: SongInput!\n  $streamingUrl: String!\n) {\n  queueSong(song: $song, streamingUrl: $streamingUrl)\n}\n"
  }
};
})();
(node as any).hash = '3e2da98382c45d6acbf78b99579be88a';
export default node;
