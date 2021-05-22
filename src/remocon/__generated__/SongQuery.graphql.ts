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
        readonly streamingUrls: ReadonlyArray<{
            readonly url: string;
            readonly isGuideVocal: boolean;
        }>;
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
    streamingUrls {
      url
      isGuideVocal
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
},
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "StreamingUrlInfo",
  "kind": "LinkedField",
  "name": "streamingUrls",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "url",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isGuideVocal",
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
          (v9/*: any*/)
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
          (v9/*: any*/),
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
    "cacheID": "952353d21e3fa7484d2b60185e54b808",
    "id": null,
    "metadata": {},
    "name": "SongQuery",
    "operationKind": "query",
    "text": "query SongQuery(\n  $id: String!\n) {\n  songById(id: $id) {\n    name\n    nameYomi\n    artistName\n    artistNameYomi\n    lyricsPreview\n    tieUp\n    playtime\n    streamingUrls {\n      url\n      isGuideVocal\n    }\n    id\n  }\n}\n"
  }
};
})();
(node as any).hash = '23f1602ba632c293673bd035fd460cc7';
export default node;
