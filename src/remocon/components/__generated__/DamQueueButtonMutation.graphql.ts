/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type QueueDamSongInput = {
    id: string;
    name: string;
    artistName: string;
    playtime?: number | null;
    streamingUrlIdx: number;
};
export type DamQueueButtonMutationVariables = {
    input: QueueDamSongInput;
};
export type DamQueueButtonMutationResponse = {
    readonly queueDamSong: number;
};
export type DamQueueButtonMutation = {
    readonly response: DamQueueButtonMutationResponse;
    readonly variables: DamQueueButtonMutationVariables;
};



/*
mutation DamQueueButtonMutation(
  $input: QueueDamSongInput!
) {
  queueDamSong(input: $input)
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "kind": "ScalarField",
    "name": "queueDamSong",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DamQueueButtonMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DamQueueButtonMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "540b04c2f3028743017b3a24b19442b8",
    "id": null,
    "metadata": {},
    "name": "DamQueueButtonMutation",
    "operationKind": "mutation",
    "text": "mutation DamQueueButtonMutation(\n  $input: QueueDamSongInput!\n) {\n  queueDamSong(input: $input)\n}\n"
  }
};
})();
(node as any).hash = '25eeb4d453472fbf27b823c3c301cc52';
export default node;
