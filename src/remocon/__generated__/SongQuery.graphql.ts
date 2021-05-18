/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type SongQueryVariables = {
    id: string;
};
export type SongQueryResponse = {
    readonly songsByIds: ReadonlyArray<{
        readonly name: string;
        readonly nameYomi: string;
        readonly artistName: string;
        readonly artistNameYomi: string;
        readonly lyricsPreview: string | null;
    }>;
};
export type SongQuery = {
    readonly response: SongQueryResponse;
    readonly variables: SongQueryVariables;
};



/*
query SongQuery(
  $id: String!
) {
  songsByIds(ids: [$id]) {
    name
    nameYomi
    artistName
    artistNameYomi
    lyricsPreview
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
    "items": [
      {
        "kind": "Variable",
        "name": "ids.0",
        "variableName": "id"
      }
    ],
    "kind": "ListValue",
    "name": "ids"
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
  "name": "nameYomi",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "artistName",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "artistNameYomi",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lyricsPreview",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SongQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Song",
        "kind": "LinkedField",
        "name": "songsByIds",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/)
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
    "name": "SongQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Song",
        "kind": "LinkedField",
        "name": "songsByIds",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "5556c37287eeb176d4a0562cf6b75490",
    "id": null,
    "metadata": {},
    "name": "SongQuery",
    "operationKind": "query",
    "text": "query SongQuery(\n  $id: String!\n) {\n  songsByIds(ids: [$id]) {\n    name\n    nameYomi\n    artistName\n    artistNameYomi\n    lyricsPreview\n    id\n  }\n}\n"
  }
};
})();
(node as any).hash = '51d6f8b86e1e2a56c442fdf5094536e7';
export default node;
