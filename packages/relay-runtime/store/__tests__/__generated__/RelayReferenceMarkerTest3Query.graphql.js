/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b9820d0b3cf0ff096801e148f0c22124>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReferenceMarkerTest3Query$variables = {|
  id: string,
  orderby?: ?$ReadOnlyArray<?string>,
|};
export type RelayReferenceMarkerTest3QueryVariables = RelayReferenceMarkerTest3Query$variables;
export type RelayReferenceMarkerTest3Query$data = {|
  +node: ?{|
    +friends?: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +cursor: ?string,
        +node: ?{|
          +id: string,
          +name: ?string,
        |},
      |}>,
    |},
  |},
|};
export type RelayReferenceMarkerTest3QueryResponse = RelayReferenceMarkerTest3Query$data;
export type RelayReferenceMarkerTest3Query = {|
  variables: RelayReferenceMarkerTest3QueryVariables,
  response: RelayReferenceMarkerTest3Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "orderby"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "kind": "Variable",
  "name": "orderby",
  "variableName": "orderby"
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  },
  (v2/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReferenceMarkerTest3Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": "friends",
                "args": [
                  (v2/*: any*/)
                ],
                "concreteType": "FriendsConnection",
                "kind": "LinkedField",
                "name": "__UserProfile_friends_bestFriends",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "FriendsEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v4/*: any*/),
                          {
                            "alias": "name",
                            "args": null,
                            "kind": "ScalarField",
                            "name": "__name_friendsName",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "User",
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
    "name": "RelayReferenceMarkerTest3Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v5/*: any*/),
                "concreteType": "FriendsConnection",
                "kind": "LinkedField",
                "name": "friends",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "FriendsEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v4/*: any*/),
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
                            "filters": null,
                            "handle": "friendsName",
                            "key": "",
                            "kind": "ScalarHandle",
                            "name": "name"
                          }
                        ],
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
                "args": (v5/*: any*/),
                "filters": [
                  "orderby"
                ],
                "handle": "bestFriends",
                "key": "UserProfile_friends",
                "kind": "LinkedHandle",
                "name": "friends"
              }
            ],
            "type": "User",
            "abstractKey": null
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "44160d95720fc41bf3cf2445cfffe259",
    "id": null,
    "metadata": {},
    "name": "RelayReferenceMarkerTest3Query",
    "operationKind": "query",
    "text": "query RelayReferenceMarkerTest3Query(\n  $id: ID!\n  $orderby: [String]\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      friends(first: 1, orderby: $orderby) {\n        edges {\n          cursor\n          node {\n            id\n            name\n          }\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "02258e36cadb343f27dbc1d667c61417";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReferenceMarkerTest3Query$variables,
  RelayReferenceMarkerTest3Query$data,
>*/);
