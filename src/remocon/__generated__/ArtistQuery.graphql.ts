/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type ArtistQueryVariables = {
    id: string;
};
export type ArtistQueryResponse = {
    readonly artistById: {
        readonly name: string;
        readonly songs: ReadonlyArray<{
            readonly id: string;
            readonly name: string;
            readonly nameYomi: string;
        }>;
    };
};
export type ArtistQuery = {
    readonly response: ArtistQueryResponse;
    readonly variables: ArtistQueryVariables;
};



/*
query ArtistQuery(
  $id: String!
) {
  artistById(id: $id) {
    name
    songs {
      id
      name
      nameYomi
    }
    id
  }
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
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "Song",
  "kind": "LinkedField",
  "name": "songs",
  "plural": true,
  "selections": [
    (v3/*: any*/),
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "nameYomi",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ArtistQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Artist",
        "kind": "LinkedField",
        "name": "artistById",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ArtistQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Artist",
        "kind": "LinkedField",
        "name": "artistById",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v4/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "29c20ced95f80c681912ee9eda8fa718",
    "id": null,
    "metadata": {},
    "name": "ArtistQuery",
    "operationKind": "query",
    "text": "query ArtistQuery(\n  $id: String!\n) {\n  artistById(id: $id) {\n    name\n    songs {\n      id\n      name\n      nameYomi\n    }\n    id\n  }\n}\n"
  }
};
})();
(node as any).hash = 'b84b54deb71bfd7a5b846509159968fd';
export default node;
