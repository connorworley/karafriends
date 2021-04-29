/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type QRCodeQueryVariables = {};
export type QRCodeQueryResponse = {
    readonly wanIpQrCode: string;
};
export type QRCodeQuery = {
    readonly response: QRCodeQueryResponse;
    readonly variables: QRCodeQueryVariables;
};



/*
query QRCodeQuery {
  wanIpQrCode
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "wanIpQrCode",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "QRCodeQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "QRCodeQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "145d9d8da5aa6b158b066cfe77108411",
    "id": null,
    "metadata": {},
    "name": "QRCodeQuery",
    "operationKind": "query",
    "text": "query QRCodeQuery {\n  wanIpQrCode\n}\n"
  }
};
})();
(node as any).hash = 'f854d0ab78aa46f47b5d3a4ead66e8d8';
export default node;
