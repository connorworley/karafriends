/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type PlayerScoringDataQueryVariables = {
    id: string;
};
export type PlayerScoringDataQueryResponse = {
    readonly scoringData: ReadonlyArray<number>;
};
export type PlayerScoringDataQuery = {
    readonly response: PlayerScoringDataQueryResponse;
    readonly variables: PlayerScoringDataQueryVariables;
};



/*
query PlayerScoringDataQuery(
  $id: String!
) {
  scoringData(id: $id)
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
    "name": "scoringData",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PlayerScoringDataQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PlayerScoringDataQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f5e325923ebc81ce9be9ab3d96a63a94",
    "id": null,
    "metadata": {},
    "name": "PlayerScoringDataQuery",
    "operationKind": "query",
    "text": "query PlayerScoringDataQuery(\n  $id: String!\n) {\n  scoringData(id: $id)\n}\n"
  }
};
})();
(node as any).hash = '92db5394747c9e386e0a1e5cf316e568';
export default node;
