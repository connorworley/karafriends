/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type ArtistPaginationQueryVariables = {
    artist_id?: string | null;
    count?: number | null;
    cursor?: string | null;
};
export type ArtistPaginationQueryResponse = {
    readonly " $fragmentRefs": FragmentRefs<"Artist_artistById">;
};
export type ArtistPaginationQuery = {
    readonly response: ArtistPaginationQueryResponse;
    readonly variables: ArtistPaginationQueryVariables;
};



/*
query ArtistPaginationQuery(
  $artist_id: String
  $count: Int = 30
  $cursor: String
) {
  ...Artist_artistById_3L9VQn
}

fragment Artist_artistById_3L9VQn on Query {
  artistById(id: $artist_id, first: $count, after: $cursor) {
    name
    songs(first: $count, after: $cursor) {
      edges {
        node {
          id
          name
          nameYomi
          __typename
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
    id
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "artist_id"
  },
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
v1 = {
  "kind": "Variable",
  "name": "after",
  "variableName": "cursor"
},
v2 = {
  "kind": "Variable",
  "name": "first",
  "variableName": "count"
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = [
  (v1/*: any*/),
  (v2/*: any*/)
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ArtistPaginationQuery",
    "selections": [
      {
        "args": [
          {
            "kind": "Variable",
            "name": "artist_id",
            "variableName": "artist_id"
          },
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
        "name": "Artist_artistById"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ArtistPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": [
          (v1/*: any*/),
          (v2/*: any*/),
          {
            "kind": "Variable",
            "name": "id",
            "variableName": "artist_id"
          }
        ],
        "concreteType": "Artist",
        "kind": "LinkedField",
        "name": "artistById",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "SongConnection",
            "kind": "LinkedField",
            "name": "songs",
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
                      (v5/*: any*/),
                      (v3/*: any*/),
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
            "args": (v4/*: any*/),
            "filters": null,
            "handle": "connection",
            "key": "ArtistPagination_songs",
            "kind": "LinkedHandle",
            "name": "songs"
          },
          (v5/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a628c8e65b08eefd14b3a881a86f8109",
    "id": null,
    "metadata": {},
    "name": "ArtistPaginationQuery",
    "operationKind": "query",
    "text": "query ArtistPaginationQuery(\n  $artist_id: String\n  $count: Int = 30\n  $cursor: String\n) {\n  ...Artist_artistById_3L9VQn\n}\n\nfragment Artist_artistById_3L9VQn on Query {\n  artistById(id: $artist_id, first: $count, after: $cursor) {\n    name\n    songs(first: $count, after: $cursor) {\n      edges {\n        node {\n          id\n          name\n          nameYomi\n          __typename\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();
(node as any).hash = '33e8e768612cabd34f9e0e852cfe9948';
export default node;
