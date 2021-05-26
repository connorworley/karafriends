/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type HistoryPaginationQueryVariables = {
    count?: number | null;
    cursor?: string | null;
};
export type HistoryPaginationQueryResponse = {
    readonly " $fragmentRefs": FragmentRefs<"History_history">;
};
export type HistoryPaginationQuery = {
    readonly response: HistoryPaginationQueryResponse;
    readonly variables: HistoryPaginationQueryVariables;
};



/*
query HistoryPaginationQuery(
  $count: Int = 30
  $cursor: String
) {
  ...History_history_1G22uz
}

fragment History_history_1G22uz on Query {
  history(first: $count, after: $cursor) {
    edges {
      node {
        song {
          id
          name
          nameYomi
          artistName
          artistNameYomi
        }
        playDate
        __typename
      }
      cursor
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": 30,
    "kind": "LocalArgument",
    "name": "count"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cursor"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "cursor"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "HistoryPaginationQuery",
    "selections": [
      {
        "args": [
          {
            "kind": "Variable",
            "name": "count",
            "variableName": "count"
          },
          {
            "kind": "Variable",
            "name": "cursor",
            "variableName": "cursor"
          }
        ],
        "kind": "FragmentSpread",
        "name": "History_history"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "HistoryPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "HistoryConnection",
        "kind": "LinkedField",
        "name": "history",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "HistoryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "HistoryItem",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Song",
                    "kind": "LinkedField",
                    "name": "song",
                    "plural": false,
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
                        "name": "name",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "nameYomi",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "artistName",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "artistNameYomi",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "playDate",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "__typename",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "cursor",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "HistoryPageInfo",
            "kind": "LinkedField",
            "name": "pageInfo",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "endCursor",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "hasNextPage",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "filters": null,
        "handle": "connection",
        "key": "HistoryPagination_history",
        "kind": "LinkedHandle",
        "name": "history"
      }
    ]
  },
  "params": {
    "cacheID": "cabdbade4e20a2a95d07a9cbeb6076b8",
    "id": null,
    "metadata": {},
    "name": "HistoryPaginationQuery",
    "operationKind": "query",
    "text": "query HistoryPaginationQuery(\n  $count: Int = 30\n  $cursor: String\n) {\n  ...History_history_1G22uz\n}\n\nfragment History_history_1G22uz on Query {\n  history(first: $count, after: $cursor) {\n    edges {\n      node {\n        song {\n          id\n          name\n          nameYomi\n          artistName\n          artistNameYomi\n        }\n        playDate\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = '394c9d814177e55bb37d7e1f64abffb4';
export default node;
