/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type useQueueQueueQueryVariables = {};
export type useQueueQueueQueryResponse = {
    readonly queue: ReadonlyArray<{
        readonly __typename?: string;
        readonly id?: string;
        readonly name?: string;
        readonly artistName?: string;
        readonly playtime?: number | null;
        readonly timestamp?: string;
    }>;
};
export type useQueueQueueQuery = {
    readonly response: useQueueQueueQueryResponse;
    readonly variables: useQueueQueueQueryVariables;
};



/*
query useQueueQueueQuery {
  queue {
    __typename
    ... on QueueItemInterface {
      __isQueueItemInterface: __typename
      __typename
      id
      name
      artistName
      playtime
      timestamp
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
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
  "name": "artistName",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "playtime",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "timestamp",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useQueueQueueQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "queue",
        "plural": true,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v0/*: any*/),
              (v1/*: any*/),
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/)
            ],
            "type": "QueueItemInterface",
            "abstractKey": "__isQueueItemInterface"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useQueueQueueQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "queue",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/)
            ],
            "type": "QueueItemInterface",
            "abstractKey": "__isQueueItemInterface"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "343c63091ac01d9630852cda26ea472c",
    "id": null,
    "metadata": {},
    "name": "useQueueQueueQuery",
    "operationKind": "query",
    "text": "query useQueueQueueQuery {\n  queue {\n    __typename\n    ... on QueueItemInterface {\n      __isQueueItemInterface: __typename\n      __typename\n      id\n      name\n      artistName\n      playtime\n      timestamp\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = '3ddf46329985288b4b4f6d43d6e2fc99';
export default node;
