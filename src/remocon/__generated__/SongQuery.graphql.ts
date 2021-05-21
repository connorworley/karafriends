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
        readonly playtime: number | null;
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
    playtime
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
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "playtime",
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
          (v7/*: any*/),
          (v8/*: any*/)
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
          (v8/*: any*/),
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
    "cacheID": "645fc4394c55febaa15c2e53720c3719",
    "id": null,
    "metadata": {},
    "name": "SongQuery",
    "operationKind": "query",
    "text": "query SongQuery(\n  $id: String!\n) {\n  songById(id: $id) {\n    name\n    nameYomi\n    artistName\n    artistNameYomi\n    lyricsPreview\n    tieUp\n    playtime\n    id\n  }\n}\n"
  }
};
})();
(node as any).hash = '028a57cb757fafa92a6e77846aa731b4';
export default node;
