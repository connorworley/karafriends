/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type ControlsQueryVariables = {};
export type ControlsQueryResponse = {
    readonly songsInQueue: ReadonlyArray<{
        readonly id: string;
        readonly name: string;
        readonly artistName: string;
    }>;
};
export type ControlsQuery = {
    readonly response: ControlsQueryResponse;
    readonly variables: ControlsQueryVariables;
};



/*
query ControlsQuery {
  songsInQueue {
    id
    name
    artistName
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Song",
    "kind": "LinkedField",
    "name": "songsInQueue",
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
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ControlsQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ControlsQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "63da096f76b04898d06821f3c5256e23",
    "id": null,
    "metadata": {},
    "name": "ControlsQuery",
    "operationKind": "query",
    "text": "query ControlsQuery {\n  songsInQueue {\n    id\n    name\n    artistName\n  }\n}\n"
  }
};
})();
(node as any).hash = 'b4341b584fc0d83c8ab4a8fbc4cb09fd';
export default node;
