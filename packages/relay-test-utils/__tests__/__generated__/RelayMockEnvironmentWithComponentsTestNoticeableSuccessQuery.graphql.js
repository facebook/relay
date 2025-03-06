/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a6ace86b2374d98ad16fe32a9d9c4131>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment$fragmentType } from "./RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment.graphql";
export type RelayMockEnvironmentWithComponentsTestNoticeableSuccessQuery$variables = {|
  cursor?: ?string,
  first?: ?number,
  id?: ?string,
|};
export type RelayMockEnvironmentWithComponentsTestNoticeableSuccessQuery$data = {|
  +user: ?{|
    +id: string,
    +name: ?string,
    +$fragmentSpreads: RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment$fragmentType,
  |},
|};
export type RelayMockEnvironmentWithComponentsTestNoticeableSuccessQuery = {|
  response: RelayMockEnvironmentWithComponentsTestNoticeableSuccessQuery$data,
  variables: RelayMockEnvironmentWithComponentsTestNoticeableSuccessQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": "",
  "kind": "LocalArgument",
  "name": "cursor"
},
v1 = {
  "defaultValue": 5,
  "kind": "LocalArgument",
  "name": "first"
},
v2 = {
  "defaultValue": "<default>",
  "kind": "LocalArgument",
  "name": "id"
},
v3 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v7 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "cursor"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockEnvironmentWithComponentsTestNoticeableSuccessQuery",
    "selections": [
      {
        "alias": "user",
        "args": (v3/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          (v5/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment"
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
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayMockEnvironmentWithComponentsTestNoticeableSuccessQuery",
    "selections": [
      {
        "alias": "user",
        "args": (v3/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v7/*: any*/),
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
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v4/*: any*/),
                          (v5/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Image",
                            "kind": "LinkedField",
                            "name": "profile_picture",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "uri",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          (v6/*: any*/)
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
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v7/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "User_friends",
                "kind": "LinkedHandle",
                "name": "friends"
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9a2f2bd50b5df1dcf7f7de0485fcfd87",
    "id": null,
    "metadata": {},
    "name": "RelayMockEnvironmentWithComponentsTestNoticeableSuccessQuery",
    "operationKind": "query",
    "text": "query RelayMockEnvironmentWithComponentsTestNoticeableSuccessQuery(\n  $id: ID = \"<default>\"\n  $first: Int = 5\n  $cursor: ID = \"\"\n) {\n  user: node(id: $id) {\n    __typename\n    id\n    name\n    ...RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment\n  }\n}\n\nfragment RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment on User {\n  id\n  friends(first: $first, after: $cursor) {\n    edges {\n      node {\n        id\n        name\n        profile_picture {\n          uri\n        }\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "130f72e8a3b1d89a616098a3f830c21a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockEnvironmentWithComponentsTestNoticeableSuccessQuery$variables,
  RelayMockEnvironmentWithComponentsTestNoticeableSuccessQuery$data,
>*/);
