/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type ControlsRemoveSongMutationVariables = {
    id: string;
    timestamp: string;
};
export type ControlsRemoveSongMutationResponse = {
    readonly removeSong: boolean;
};
export type ControlsRemoveSongMutation = {
    readonly response: ControlsRemoveSongMutationResponse;
    readonly variables: ControlsRemoveSongMutationVariables;
};



/*
mutation ControlsRemoveSongMutation(
  $id: String!
  $timestamp: String!
) {
  removeSong(id: $id, timestamp: $timestamp)
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "timestamp"
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
      },
      {
        "kind": "Variable",
        "name": "timestamp",
        "variableName": "timestamp"
      }
    ],
    "kind": "ScalarField",
    "name": "removeSong",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ControlsRemoveSongMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ControlsRemoveSongMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "600f83df9ffb316c0095114355b665b2",
    "id": null,
    "metadata": {},
    "name": "ControlsRemoveSongMutation",
    "operationKind": "mutation",
    "text": "mutation ControlsRemoveSongMutation(\n  $id: String!\n  $timestamp: String!\n) {\n  removeSong(id: $id, timestamp: $timestamp)\n}\n"
  }
};
})();
(node as any).hash = '105af26e7ca38039e17c7c70a3afb3cf';
export default node;
