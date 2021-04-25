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
    "cacheID": "36096fc250921ea1e647f9bfd050f49e",
    "id": null,
    "metadata": {},
    "name": "ArtistSearchQuery",
    "operationKind": "query",
    "text": "query ArtistSearchQuery(\n  $name: String\n) {\n  artistsByName(name: $name) {\n    id\n    name\n  }\n}\n"
  }
};
})();
(node as any).hash = 'b31e1d4cd8988ca5278c04b42e9c5b51';
export default node;
