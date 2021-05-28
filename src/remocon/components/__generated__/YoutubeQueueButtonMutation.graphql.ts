/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type QueueYoutubeSongInput = {
    id: string;
    name: string;
    artistName: string;
    playtime?: number | null;
};
export type YoutubeQueueButtonMutationVariables = {
    input: QueueYoutubeSongInput;
};
export type YoutubeQueueButtonMutationResponse = {
    readonly queueYoutubeSong: number;
};
export type YoutubeQueueButtonMutation = {
    readonly response: YoutubeQueueButtonMutationResponse;
    readonly variables: YoutubeQueueButtonMutationVariables;
};



/*
mutation YoutubeQueueButtonMutation(
  $input: QueueYoutubeSongInput!
) {
  queueYoutubeSong(input: $input)
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
    "name": "queueYoutubeSong",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "YoutubeQueueButtonMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "YoutubeQueueButtonMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f47c1c6c378693f6068c1dbe538e6c58",
    "id": null,
    "metadata": {},
    "name": "YoutubeQueueButtonMutation",
    "operationKind": "mutation",
    "text": "mutation YoutubeQueueButtonMutation(\n  $input: QueueYoutubeSongInput!\n) {\n  queueYoutubeSong(input: $input)\n}\n"
  }
};
})();
(node as any).hash = '146721ed53a2cb03e42eacf51f94b6a8';
export default node;
