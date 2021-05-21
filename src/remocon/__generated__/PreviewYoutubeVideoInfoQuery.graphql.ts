/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type PreviewYoutubeVideoInfoQueryVariables = {
    videoId: string;
};
export type PreviewYoutubeVideoInfoQueryResponse = {
    readonly youtubeVideoInfo: {
        readonly __typename: "YoutubeVideoInfo";
        readonly author: string;
        readonly channelId: string;
        readonly keywords: ReadonlyArray<string> | null;
        readonly lengthSeconds: number;
        readonly description: string;
        readonly title: string;
        readonly viewCount: number;
    } | {
        readonly __typename: "YoutubeVideoInfoError";
        readonly reason: string;
    } | {
        /*This will never be '%other', but we need some
        value in case none of the concrete values match.*/
        readonly __typename: "%other";
    };
};
export type PreviewYoutubeVideoInfoQuery = {
    readonly response: PreviewYoutubeVideoInfoQueryResponse;
    readonly variables: PreviewYoutubeVideoInfoQueryVariables;
};



/*
query PreviewYoutubeVideoInfoQuery(
  $videoId: String!
) {
  youtubeVideoInfo(videoId: $videoId) {
    __typename
    ... on YoutubeVideoInfo {
      __typename
      author
      channelId
      keywords
      lengthSeconds
      description
      title
      viewCount
    }
    ... on YoutubeVideoInfoError {
      __typename
      reason
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "videoId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "videoId",
    "variableName": "videoId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "author",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "channelId",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "keywords",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lengthSeconds",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewCount",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "reason",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PreviewYoutubeVideoInfoQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "youtubeVideoInfo",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/)
            ],
            "type": "YoutubeVideoInfo",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/),
              (v10/*: any*/)
            ],
            "type": "YoutubeVideoInfoError",
            "abstractKey": null
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PreviewYoutubeVideoInfoQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "youtubeVideoInfo",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/)
            ],
            "type": "YoutubeVideoInfo",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v10/*: any*/)
            ],
            "type": "YoutubeVideoInfoError",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6072a88ed761bb0835277d6409c9d076",
    "id": null,
    "metadata": {},
    "name": "PreviewYoutubeVideoInfoQuery",
    "operationKind": "query",
    "text": "query PreviewYoutubeVideoInfoQuery(\n  $videoId: String!\n) {\n  youtubeVideoInfo(videoId: $videoId) {\n    __typename\n    ... on YoutubeVideoInfo {\n      __typename\n      author\n      channelId\n      keywords\n      lengthSeconds\n      description\n      title\n      viewCount\n    }\n    ... on YoutubeVideoInfoError {\n      __typename\n      reason\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = 'fd21fd1e8f1f3292a0c040550fe21fcf';
export default node;
