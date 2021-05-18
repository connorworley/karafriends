/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type useQueueQueueQueryVariables = {};
export type useQueueQueueQueryResponse = {
    readonly queue: ReadonlyArray<{
        readonly songId: string;
        readonly timestamp: string;
    }>;
};
export type useQueueQueueQuery = {
    readonly response: useQueueQueueQueryResponse;
    readonly variables: useQueueQueueQueryVariables;
};



/*
query useQueueQueueQuery {
  queue {
    songId
    timestamp
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "QueueItem",
    "kind": "LinkedField",
    "name": "queue",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "songId",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "timestamp",
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
    "name": "useQueueQueueQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useQueueQueueQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "f7c83bd87998bfbbf79ee4e6ae0c23f3",
    "id": null,
    "metadata": {},
    "name": "useQueueQueueQuery",
    "operationKind": "query",
    "text": "query useQueueQueueQuery {\n  queue {\n    songId\n    timestamp\n  }\n}\n"
  }
};
})();
(node as any).hash = '9505a4ce90449183bc910e9b64daa3bc';
export default node;
