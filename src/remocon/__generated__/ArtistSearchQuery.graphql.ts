/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type ArtistSearchQueryVariables = {
    name?: string | null;
};
export type ArtistSearchQueryResponse = {
    readonly artistsByName: ReadonlyArray<{
        readonly id: string;
        readonly name: string;
        readonly nameYomi: string;
        readonly songCount: number;
    }>;
};
export type ArtistSearchQuery = {
    readonly response: ArtistSearchQueryResponse;
    readonly variables: ArtistSearchQueryVariables;
};



/*
query ArtistSearchQuery(
  $name: String
) {
  artistsByName(name: $name) {
    id
    name
    nameYomi
    songCount
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
    "concreteType": "Artist",
    "kind": "LinkedField",
    "name": "artistsByName",
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
        "name": "nameYomi",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "songCount",
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
    "name": "ArtistSearchQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ArtistSearchQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d971ed236b065b2e60aea6883dc5e852",
    "id": null,
    "metadata": {},
    "name": "ArtistSearchQuery",
    "operationKind": "query",
    "text": "query ArtistSearchQuery(\n  $name: String\n) {\n  artistsByName(name: $name) {\n    id\n    name\n    nameYomi\n    songCount\n  }\n}\n"
  }
};
})();
(node as any).hash = 'f671ac7c9059082adda483bb38a3718c';
export default node;
