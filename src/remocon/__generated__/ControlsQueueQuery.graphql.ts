/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type ControlsQueueQueryVariables = {};
export type ControlsQueueQueryResponse = {
    readonly queue: ReadonlyArray<{
        readonly songId: string;
        readonly timestamp: string;
    }>;
};
export type ControlsQueueQuery = {
    readonly response: ControlsQueueQueryResponse;
    readonly variables: ControlsQueueQueryVariables;
};



/*
query ControlsQueueQuery {
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
    "name": "ControlsQueueQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ControlsQueueQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "133069580ec378e77ccfb867d043608e",
    "id": null,
    "metadata": {},
    "name": "ControlsQueueQuery",
    "operationKind": "query",
    "text": "query ControlsQueueQuery {\n  queue {\n    songId\n    timestamp\n  }\n}\n"
  }
};
})();
(node as any).hash = '84a9efa2f00a4edb5e17063c3121f21b';
export default node;
