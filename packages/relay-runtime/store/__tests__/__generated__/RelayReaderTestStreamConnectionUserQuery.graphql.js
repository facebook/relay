/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c7339f663662529933416a488254a64e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderTestStreamConnectionUserProfile$fragmentType } from "./RelayReaderTestStreamConnectionUserProfile.graphql";
export type RelayReaderTestStreamConnectionUserQuery$variables = {|
  id: string,
|};
export type RelayReaderTestStreamConnectionUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayReaderTestStreamConnectionUserProfile$fragmentType,
  |},
|};
export type RelayReaderTestStreamConnectionUserQuery = {|
  response: RelayReaderTestStreamConnectionUserQuery$data,
  variables: RelayReaderTestStreamConnectionUserQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 3
  }
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestStreamConnectionUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayReaderTestStreamConnectionUserProfile"
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayReaderTestStreamConnectionUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v3/*:: as any*/),
                "concreteType": "FriendsConnection",
                "kind": "LinkedField",
                "name": "friends",
                "plural": false,
                "selections": [
                  {
                    "if": null,
                    "kind": "Stream",
                    "label": "RelayReaderTestStreamConnectionUserProfile$stream$UserProfile_friends",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "FriendsEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "User",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "name",
                                "storageKey": null
                              },
                              (v4/*:: as any*/),
                              (v2/*:: as any*/)
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
                      }
                    ]
                  },
                  {
                    "if": null,
                    "kind": "Defer",
                    "label": "RelayReaderTestStreamConnectionUserProfile$defer$UserProfile_friends$pageInfo",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PageInfo",
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
                    ]
                  }
                ],
                "storageKey": "friends(first:3)"
              },
              {
                "alias": null,
                "args": (v3/*:: as any*/),
                "filters": null,
                "handle": "connection",
                "key": "UserProfile_friends",
                "kind": "LinkedHandle",
                "name": "friends"
              }
            ],
            "type": "User",
            "abstractKey": null
          },
          (v4/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "86d1b720aaf45195cf84453ca6c32530",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestStreamConnectionUserQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestStreamConnectionUserQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayReaderTestStreamConnectionUserProfile\n    id\n  }\n}\n\nfragment RelayReaderTestStreamConnectionUserProfile on User {\n  friends(first: 3) {\n    edges @stream(label: \"RelayReaderTestStreamConnectionUserProfile$stream$UserProfile_friends\", initial_count: 0) {\n      node {\n        name\n        id\n        __typename\n      }\n      cursor\n    }\n    ... @defer(label: \"RelayReaderTestStreamConnectionUserProfile$defer$UserProfile_friends$pageInfo\") {\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "6fea4f22e3efe059099ef5cfa350fc9c";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderTestStreamConnectionUserQuery$variables,
  RelayReaderTestStreamConnectionUserQuery$data,
>*/);
