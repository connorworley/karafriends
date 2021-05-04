/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type PlayerStreamingUrlQueryVariables = {
    id: string;
};
export type PlayerStreamingUrlQueryResponse = {
    readonly streamingUrl: string;
};
export type PlayerStreamingUrlQuery = {
    readonly response: PlayerStreamingUrlQueryResponse;
    readonly variables: PlayerStreamingUrlQueryVariables;
};



/*
query PlayerStreamingUrlQuery(
  $id: String!
) {
  streamingUrl(id: $id)
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
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "kind": "ScalarField",
    "name": "streamingUrl",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PlayerStreamingUrlQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PlayerStreamingUrlQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "99362180a2ffc5f27cccd0c5fcbd57a7",
    "id": null,
    "metadata": {},
    "name": "PlayerStreamingUrlQuery",
    "operationKind": "query",
    "text": "query PlayerStreamingUrlQuery(\n  $id: String!\n) {\n  streamingUrl(id: $id)\n}\n"
  }
};
})();
(node as any).hash = '1ebeeebaa02d944cdb46c6fce87abe09';
export default node;
