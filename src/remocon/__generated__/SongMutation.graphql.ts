/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type SongMutationVariables = {
    songId: string;
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
  $songId: String!
) {
  queueSong(songId: $songId)
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "songId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "songId",
        "variableName": "songId"
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
    "cacheID": "c3186b792719793a539b156a2050cd15",
    "id": null,
    "metadata": {},
    "name": "SongMutation",
    "operationKind": "mutation",
    "text": "mutation SongMutation(\n  $songId: String!\n) {\n  queueSong(songId: $songId)\n}\n"
  }
};
})();
(node as any).hash = 'ea978df77faa814efa378b6a9abc57b1';
export default node;
