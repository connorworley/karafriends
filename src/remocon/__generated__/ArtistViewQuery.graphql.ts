/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type ArtistViewQueryVariables = {
    artist_id?: string | null;
};
export type ArtistViewQueryResponse = {
    readonly " $fragmentRefs": FragmentRefs<"Artist_artistById">;
};
export type ArtistViewQuery = {
    readonly response: ArtistViewQueryResponse;
    readonly variables: ArtistViewQueryVariables;
};



/*
query ArtistViewQuery(
  $artist_id: String
) {
  ...Artist_artistById_czBiW
}

fragment Artist_artistById_czBiW on Query {
  artistById(id: $artist_id, first: 30) {
    name
    songCount
    songs(first: 30) {
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
  }
],
v1 = {
  "kind": "Literal",
  "name": "first",
  "value": 30
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = [
  (v1/*: any*/)
],
v4 = {
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
    "name": "ArtistViewQuery",
    "selections": [
      {
        "args": [
          {
            "kind": "Variable",
            "name": "artist_id",
            "variableName": "artist_id"
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
    "name": "ArtistViewQuery",
    "selections": [
      {
        "alias": null,
        "args": [
          (v1/*: any*/),
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
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "songCount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v3/*: any*/),
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
                      (v4/*: any*/),
                      (v2/*: any*/),
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
            "storageKey": "songs(first:30)"
          },
          {
            "alias": null,
            "args": (v3/*: any*/),
            "filters": null,
            "handle": "connection",
            "key": "ArtistPagination_songs",
            "kind": "LinkedHandle",
            "name": "songs"
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b6d10e259df3c772eb43791753ca7c90",
    "id": null,
    "metadata": {},
    "name": "ArtistViewQuery",
    "operationKind": "query",
    "text": "query ArtistViewQuery(\n  $artist_id: String\n) {\n  ...Artist_artistById_czBiW\n}\n\nfragment Artist_artistById_czBiW on Query {\n  artistById(id: $artist_id, first: 30) {\n    name\n    songCount\n    songs(first: 30) {\n      edges {\n        node {\n          id\n          name\n          nameYomi\n          __typename\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();
(node as any).hash = 'b8d80ef14993f3bd2bcc543e82a5b08c';
export default node;
