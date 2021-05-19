/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type ArtistSearchResultsPaginationQueryVariables = {
    count?: number | null;
    cursor?: string | null;
    name?: string | null;
};
export type ArtistSearchResultsPaginationQueryResponse = {
    readonly " $fragmentRefs": FragmentRefs<"ArtistSearchResults_artistsByName">;
};
export type ArtistSearchResultsPaginationQuery = {
    readonly response: ArtistSearchResultsPaginationQueryResponse;
    readonly variables: ArtistSearchResultsPaginationQueryVariables;
};



/*
query ArtistSearchResultsPaginationQuery(
  $count: Int = 30
  $cursor: String
  $name: String
) {
  ...ArtistSearchResults_artistsByName_4mbEMW
}

fragment ArtistSearchResults_artistsByName_4mbEMW on Query {
  artistsByName(name: $name, first: $count, after: $cursor) {
    edges {
      node {
        id
        name
        nameYomi
        songCount
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
    "name": "ArtistSearchResultsPaginationQuery",
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
        "name": "ArtistSearchResults_artistsByName"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ArtistSearchResultsPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "ArtistConnection",
        "kind": "LinkedField",
        "name": "artistsByName",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ArtistEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Artist",
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
                    "name": "songCount",
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
            "concreteType": "ArtistPageInfo",
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
        "key": "ArtistSearchResultsPagination_artistsByName",
        "kind": "LinkedHandle",
        "name": "artistsByName"
      }
    ]
  },
  "params": {
    "cacheID": "57c60836e37483e85e6b9978412a4d49",
    "id": null,
    "metadata": {},
    "name": "ArtistSearchResultsPaginationQuery",
    "operationKind": "query",
    "text": "query ArtistSearchResultsPaginationQuery(\n  $count: Int = 30\n  $cursor: String\n  $name: String\n) {\n  ...ArtistSearchResults_artistsByName_4mbEMW\n}\n\nfragment ArtistSearchResults_artistsByName_4mbEMW on Query {\n  artistsByName(name: $name, first: $count, after: $cursor) {\n    edges {\n      node {\n        id\n        name\n        nameYomi\n        songCount\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = '88df84b99d2d84e4a3d29499157873b4';
export default node;
