/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type ControlsSongsQueryVariables = {
    ids: Array<string>;
};
export type ControlsSongsQueryResponse = {
    readonly songsByIds: ReadonlyArray<{
        readonly id: string;
        readonly name: string;
        readonly artistName: string;
    }>;
};
export type ControlsSongsQuery = {
    readonly response: ControlsSongsQueryResponse;
    readonly variables: ControlsSongsQueryVariables;
};



/*
query ControlsSongsQuery(
  $ids: [String!]!
) {
  songsByIds(ids: $ids) {
    id
    name
    artistName
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "ids"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "ids",
        "variableName": "ids"
      }
    ],
    "concreteType": "Song",
    "kind": "LinkedField",
    "name": "songsByIds",
    "plural": true,
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
        "name": "name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "artistName",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ControlsSongsQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ControlsSongsQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "6b2df28d68e16d1ff38897e2d126cbde",
    "id": null,
    "metadata": {},
    "name": "ControlsSongsQuery",
    "operationKind": "query",
    "text": "query ControlsSongsQuery(\n  $ids: [String!]!\n) {\n  songsByIds(ids: $ids) {\n    id\n    name\n    artistName\n  }\n}\n"
  }
};
})();
(node as any).hash = '17390d7c790f95512668f8c25b910d9d';
export default node;
