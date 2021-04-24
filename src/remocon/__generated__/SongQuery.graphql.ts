/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type SongQueryVariables = {
    id: string;
};
export type SongQueryResponse = {
    readonly songsByIds: ReadonlyArray<{
        readonly id: string;
        readonly name: string;
        readonly artistName: string;
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
    id
    name
    artistName
    lyricsPreview
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
    "alias": null,
    "args": [
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "lyricsPreview",
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
    "name": "SongQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SongQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "7fa68f8678b5eaaef240a8a19a25b40c",
    "id": null,
    "metadata": {},
    "name": "SongQuery",
    "operationKind": "query",
    "text": "query SongQuery(\n  $id: String!\n) {\n  songsByIds(ids: [$id]) {\n    id\n    name\n    artistName\n    lyricsPreview\n  }\n}\n"
  }
};
})();
(node as any).hash = 'bce3e15ca1bea147697e09268f3f3683';
export default node;
