/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type ArtistSearchResultsViewQueryVariables = {
    name?: string | null;
};
export type ArtistSearchResultsViewQueryResponse = {
    readonly " $fragmentRefs": FragmentRefs<"ArtistSearchResults_artistsByName">;
};
export type ArtistSearchResultsViewQuery = {
    readonly response: ArtistSearchResultsViewQueryResponse;
    readonly variables: ArtistSearchResultsViewQueryVariables;
};



/*
query ArtistSearchResultsViewQuery(
  $name: String
) {
  ...ArtistSearchResults_artistsByName_2aiVTE
}

fragment ArtistSearchResults_artistsByName_2aiVTE on Query {
  artistsByName(name: $name, first: 30) {
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
    "kind": "Literal",
    "name": "first",
    "value": 30
  },
  (v1/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ArtistSearchResultsViewQuery",
    "selections": [
      {
        "args": [
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
    "name": "ArtistSearchResultsViewQuery",
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
    "cacheID": "98b478a71bd6946a813c56a94d7335c8",
    "id": null,
    "metadata": {},
    "name": "ArtistSearchResultsViewQuery",
    "operationKind": "query",
    "text": "query ArtistSearchResultsViewQuery(\n  $name: String\n) {\n  ...ArtistSearchResults_artistsByName_2aiVTE\n}\n\nfragment ArtistSearchResults_artistsByName_2aiVTE on Query {\n  artistsByName(name: $name, first: 30) {\n    edges {\n      node {\n        id\n        name\n        nameYomi\n        songCount\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = '578bb44d2db7cdd7a1d7aafe2f20c6ac';
export default node;
