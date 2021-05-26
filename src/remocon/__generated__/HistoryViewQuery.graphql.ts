/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type HistoryViewQueryVariables = {};
export type HistoryViewQueryResponse = {
    readonly " $fragmentRefs": FragmentRefs<"History_history">;
};
export type HistoryViewQuery = {
    readonly response: HistoryViewQueryResponse;
    readonly variables: HistoryViewQueryVariables;
};



/*
query HistoryViewQuery {
  ...History_history
}

fragment History_history on Query {
  history(first: 30) {
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
    "kind": "Literal",
    "name": "first",
    "value": 30
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "HistoryViewQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "History_history"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "HistoryViewQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
        "storageKey": "history(first:30)"
      },
      {
        "alias": null,
        "args": (v0/*: any*/),
        "filters": null,
        "handle": "connection",
        "key": "HistoryPagination_history",
        "kind": "LinkedHandle",
        "name": "history"
      }
    ]
  },
  "params": {
    "cacheID": "405eb29eda0bd42b28d0dc00122b179a",
    "id": null,
    "metadata": {},
    "name": "HistoryViewQuery",
    "operationKind": "query",
    "text": "query HistoryViewQuery {\n  ...History_history\n}\n\nfragment History_history on Query {\n  history(first: 30) {\n    edges {\n      node {\n        song {\n          id\n          name\n          nameYomi\n          artistName\n          artistNameYomi\n        }\n        playDate\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = 'fd3b23e7d9dd27dfc9fd8a966fea54da';
export default node;
