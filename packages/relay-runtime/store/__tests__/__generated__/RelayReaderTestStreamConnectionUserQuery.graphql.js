/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<28995aa664a4f44be60e216bb02b9d47>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderTestStreamConnectionUserProfile$fragmentType = any;
export type RelayReaderTestStreamConnectionUserQuery$variables = {|
  id: string,
|};
export type RelayReaderTestStreamConnectionUserQueryVariables = RelayReaderTestStreamConnectionUserQuery$variables;
export type RelayReaderTestStreamConnectionUserQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayReaderTestStreamConnectionUserProfile$fragmentType,
  |},
|};
export type RelayReaderTestStreamConnectionUserQueryResponse = RelayReaderTestStreamConnectionUserQuery$data;
export type RelayReaderTestStreamConnectionUserQuery = {|
  variables: RelayReaderTestStreamConnectionUserQueryVariables,
  response: RelayReaderTestStreamConnectionUserQuery$data,
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestStreamConnectionUserQuery",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayReaderTestStreamConnectionUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v3/*: any*/),
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
                              (v4/*: any*/),
                              (v2/*: any*/)
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
                "args": (v3/*: any*/),
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
          (v4/*: any*/)
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
  (node/*: any*/).hash = "49574b98d8f989c7596cd7bf981f5a7e";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestStreamConnectionUserQuery$variables,
  RelayReaderTestStreamConnectionUserQuery$data,
>*/);
