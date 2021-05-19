/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type SongSearchResultsPaginationQueryVariables = {
    count?: number | null;
    cursor?: string | null;
    name?: string | null;
};
export type SongSearchResultsPaginationQueryResponse = {
    readonly " $fragmentRefs": FragmentRefs<"SongSearchResults_songsByName">;
};
export type SongSearchResultsPaginationQuery = {
    readonly response: SongSearchResultsPaginationQueryResponse;
    readonly variables: SongSearchResultsPaginationQueryVariables;
};



/*
query SongSearchResultsPaginationQuery(
  $count: Int = 30
  $cursor: String
  $name: String
) {
  ...SongSearchResults_songsByName_4mbEMW
}

fragment SongSearchResults_songsByName_4mbEMW on Query {
  songsByName(name: $name, first: $count, after: $cursor) {
    edges {
      node {
        id
        name
        nameYomi
        artistName
        artistNameYomi
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
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  }
],
v1 = {
  "kind": "Variable",
  "name": "name",
  "variableName": "name"
},
v2 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "cursor"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
  },
  (v1/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SongSearchResultsPaginationQuery",
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
          },
          (v1/*: any*/)
        ],
        "kind": "FragmentSpread",
        "name": "SongSearchResults_songsByName"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SongSearchResultsPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "SongConnection",
        "kind": "LinkedField",
        "name": "songsByName",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "SongEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Song",
                "kind": "LinkedField",
                "name": "node",
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
            "concreteType": "SongPageInfo",
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
        "args": (v2/*: any*/),
        "filters": [
          "name"
        ],
        "handle": "connection",
        "key": "SongSearchResultsPagination_songsByName",
        "kind": "LinkedHandle",
        "name": "songsByName"
      }
    ]
  },
  "params": {
    "cacheID": "36468f59f0a1078a52e0a7e4b20baa0e",
    "id": null,
    "metadata": {},
    "name": "SongSearchResultsPaginationQuery",
    "operationKind": "query",
    "text": "query SongSearchResultsPaginationQuery(\n  $count: Int = 30\n  $cursor: String\n  $name: String\n) {\n  ...SongSearchResults_songsByName_4mbEMW\n}\n\nfragment SongSearchResults_songsByName_4mbEMW on Query {\n  songsByName(name: $name, first: $count, after: $cursor) {\n    edges {\n      node {\n        id\n        name\n        nameYomi\n        artistName\n        artistNameYomi\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = '7d3fabe0be6122afd3695e2091ffc805';
export default node;
