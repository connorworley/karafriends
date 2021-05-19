/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type SongQueryVariables = {
    id: string;
};
export type SongQueryResponse = {
    readonly songById: {
        readonly name: string;
        readonly nameYomi: string;
        readonly artistName: string;
        readonly artistNameYomi: string;
        readonly lyricsPreview: string | null;
        readonly tieUp: string | null;
    };
};
export type SongQuery = {
    readonly response: SongQueryResponse;
    readonly variables: SongQueryVariables;
};



/*
query SongQuery(
  $id: String!
) {
  songById(id: $id) {
    name
    nameYomi
    artistName
    artistNameYomi
    lyricsPreview
    tieUp
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
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tieUp",
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
        "name": "songById",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/)
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
        "name": "songById",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
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
    "cacheID": "23b80e9567e7400e11ad0036ba8e81a7",
    "id": null,
    "metadata": {},
    "name": "SongQuery",
    "operationKind": "query",
    "text": "query SongQuery(\n  $id: String!\n) {\n  songById(id: $id) {\n    name\n    nameYomi\n    artistName\n    artistNameYomi\n    lyricsPreview\n    tieUp\n    id\n  }\n}\n"
  }
};
})();
(node as any).hash = '43973d4d058ac3be99326efa43175e45';
export default node;
