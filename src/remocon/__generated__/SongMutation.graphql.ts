/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type SongMutationVariables = {
    id: string;
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
  $id: String!
) {
  queueSong(id: $id)
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
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
    "cacheID": "d478440211a2642eaa3238a5dfa758b9",
    "id": null,
    "metadata": {},
    "name": "SongMutation",
    "operationKind": "mutation",
    "text": "mutation SongMutation(\n  $id: String!\n) {\n  queueSong(id: $id)\n}\n"
  }
};
})();
(node as any).hash = 'b7b00a49d57720a83be6a8b3d1441202';
export default node;
