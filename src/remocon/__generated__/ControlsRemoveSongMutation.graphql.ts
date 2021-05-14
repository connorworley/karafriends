/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type ControlsRemoveSongMutationVariables = {
    songId: string;
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
  $songId: String!
  $timestamp: String!
) {
  removeSong(songId: $songId, timestamp: $timestamp)
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "songId"
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
        "name": "songId",
        "variableName": "songId"
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
    "cacheID": "772d0a552588e50d37ec8da0b4ef9ff5",
    "id": null,
    "metadata": {},
    "name": "ControlsRemoveSongMutation",
    "operationKind": "mutation",
    "text": "mutation ControlsRemoveSongMutation(\n  $songId: String!\n  $timestamp: String!\n) {\n  removeSong(songId: $songId, timestamp: $timestamp)\n}\n"
  }
};
})();
(node as any).hash = '0070693eb4be2672945ea0228add4870';
export default node;
