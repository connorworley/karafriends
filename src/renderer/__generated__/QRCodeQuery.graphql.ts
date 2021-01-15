/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type QRCodeQueryVariables = {};
export type QRCodeQueryResponse = {
    readonly wanIpAddress: string;
};
export type QRCodeQuery = {
    readonly response: QRCodeQueryResponse;
    readonly variables: QRCodeQueryVariables;
};



/*
query QRCodeQuery {
  wanIpAddress
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "wanIpAddress",
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
    "cacheID": "50411393b257b584f25303c86a171d3d",
    "id": null,
    "metadata": {},
    "name": "QRCodeQuery",
    "operationKind": "query",
    "text": "query QRCodeQuery {\n  wanIpAddress\n}\n"
  }
};
})();
(node as any).hash = 'aca1dc4391dd073d951f1607bc7b9519';
export default node;
