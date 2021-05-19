/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type SongSearchResultsViewQueryVariables = {
    name?: string | null;
};
export type SongSearchResultsViewQueryResponse = {
    readonly " $fragmentRefs": FragmentRefs<"SongSearchResults_songsByName">;
};
export type SongSearchResultsViewQuery = {
    readonly response: SongSearchResultsViewQueryResponse;
    readonly variables: SongSearchResultsViewQueryVariables;
};



/*
query SongSearchResultsViewQuery(
  $name: String
) {
  ...SongSearchResults_songsByName_2aiVTE
}

fragment SongSearchResults_songsByName_2aiVTE on Query {
  songsByName(name: $name, first: 30) {
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
    "name": "SongSearchResultsViewQuery",
    "selections": [
      {
        "args": [
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
    "name": "SongSearchResultsViewQuery",
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
    "cacheID": "ede9516e85ab9ab65df539e69dac8624",
    "id": null,
    "metadata": {},
    "name": "SongSearchResultsViewQuery",
    "operationKind": "query",
    "text": "query SongSearchResultsViewQuery(\n  $name: String\n) {\n  ...SongSearchResults_songsByName_2aiVTE\n}\n\nfragment SongSearchResults_songsByName_2aiVTE on Query {\n  songsByName(name: $name, first: 30) {\n    edges {\n      node {\n        id\n        name\n        nameYomi\n        artistName\n        artistNameYomi\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = 'b16244824cf045c86da60c956ab0268d';
export default node;
