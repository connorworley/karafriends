/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type ControlsQueueQueryVariables = {};
export type ControlsQueueQueryResponse = {
    readonly queue: ReadonlyArray<{
        readonly id: string;
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
    id
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
        "name": "id",
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
    "cacheID": "b3f37a8956711dd458986cd841262613",
    "id": null,
    "metadata": {},
    "name": "ControlsQueueQuery",
    "operationKind": "query",
    "text": "query ControlsQueueQuery {\n  queue {\n    id\n    timestamp\n  }\n}\n"
  }
};
})();
(node as any).hash = '976ff26569a6aa0b29a3a2278f485bfd';
export default node;
