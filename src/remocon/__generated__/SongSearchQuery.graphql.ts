/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type SongSearchQueryVariables = {
    name?: string | null;
};
export type SongSearchQueryResponse = {
    readonly songsByName: ReadonlyArray<{
        readonly id: string;
        readonly name: string;
        readonly artistName: string;
    }>;
};
export type SongSearchQuery = {
    readonly response: SongSearchQueryResponse;
    readonly variables: SongSearchQueryVariables;
};



/*
query SongSearchQuery(
  $name: String
) {
  songsByName(name: $name) {
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
    "name": "name"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "Song",
    "kind": "LinkedField",
    "name": "songsByName",
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
    "name": "SongSearchQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SongSearchQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "0b27a6c86db86a7f3dd01abb720e6fed",
    "id": null,
    "metadata": {},
    "name": "SongSearchQuery",
    "operationKind": "query",
    "text": "query SongSearchQuery(\n  $name: String\n) {\n  songsByName(name: $name) {\n    id\n    name\n    artistName\n  }\n}\n"
  }
};
})();
(node as any).hash = '6d0d10e1b6fb01560fcf6881122dc3ad';
export default node;
