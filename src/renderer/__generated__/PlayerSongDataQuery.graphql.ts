/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type PlayerSongDataQueryVariables = {
    id: string;
};
export type PlayerSongDataQueryResponse = {
    readonly songById: {
        readonly streamingUrls: ReadonlyArray<string>;
        readonly scoringData: ReadonlyArray<number>;
    };
};
export type PlayerSongDataQuery = {
    readonly response: PlayerSongDataQueryResponse;
    readonly variables: PlayerSongDataQueryVariables;
};



/*
query PlayerSongDataQuery(
  $id: String!
) {
  songById(id: $id) {
    streamingUrls
    scoringData
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
  "name": "streamingUrls",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scoringData",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PlayerSongDataQuery",
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
          (v3/*: any*/)
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
    "name": "PlayerSongDataQuery",
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
    "cacheID": "8279b8c7714a92a717416acc00270c08",
    "id": null,
    "metadata": {},
    "name": "PlayerSongDataQuery",
    "operationKind": "query",
    "text": "query PlayerSongDataQuery(\n  $id: String!\n) {\n  songById(id: $id) {\n    streamingUrls\n    scoringData\n    id\n  }\n}\n"
  }
};
})();
(node as any).hash = '4780a214f5d702d207b9fd99927aa169';
export default node;
