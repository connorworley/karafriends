/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type SongInput = {
    id: string;
    name: string;
    nameYomi: string;
    artistName: string;
    artistNameYomi: string;
    lyricsPreview?: string | null;
    tieUp?: string | null;
};
export type SongMutationVariables = {
    song: SongInput;
};
export type SongMutationResponse = {
    readonly queueSong: boolean;
};
export type SongMutation = {
    readonly response: SongMutationResponse;
    readonly variables: SongMutationVariables;
};



/*
mutation SongMutation(
  $song: SongInput!
) {
  queueSong(song: $song)
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "song"
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
    "name": "SongMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SongMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d1d11a2f94c3d8044173057bec2641e3",
    "id": null,
    "metadata": {},
    "name": "SongMutation",
    "operationKind": "mutation",
    "text": "mutation SongMutation(\n  $song: SongInput!\n) {\n  queueSong(song: $song)\n}\n"
  }
};
})();
(node as any).hash = 'fae36ceb178c21999c0b159affc55fed';
export default node;
