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
        readonly nameYomi: string;
        readonly artistName: string;
        readonly artistNameYomi: string;
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
    nameYomi
    artistName
    artistNameYomi
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
        "name": "nameYomi",
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
        "name": "artistNameYomi",
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
    "cacheID": "228bab14e0d2ef26ad320676abfbecca",
    "id": null,
    "metadata": {},
    "name": "SongSearchQuery",
    "operationKind": "query",
    "text": "query SongSearchQuery(\n  $name: String\n) {\n  songsByName(name: $name) {\n    id\n    name\n    nameYomi\n    artistName\n    artistNameYomi\n  }\n}\n"
  }
};
})();
(node as any).hash = '71e7e19634d8dbd0549192eae1a2263c';
export default node;
