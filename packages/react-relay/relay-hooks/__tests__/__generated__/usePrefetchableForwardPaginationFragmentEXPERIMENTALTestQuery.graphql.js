/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8a5cc6645690b01d77261e637131b458>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user$fragmentType } from "./usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user.graphql";
export type usePrefetchableForwardPaginationFragmentEXPERIMENTALTestQuery$variables = {|
  after?: ?string,
  before?: ?string,
  first?: ?number,
  id: string,
  last?: ?number,
|};
export type usePrefetchableForwardPaginationFragmentEXPERIMENTALTestQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user$fragmentType,
  |},
|};
export type usePrefetchableForwardPaginationFragmentEXPERIMENTALTestQuery = {|
  response: usePrefetchableForwardPaginationFragmentEXPERIMENTALTestQuery$data,
  variables: usePrefetchableForwardPaginationFragmentEXPERIMENTALTestQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "before"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "last"
},
v5 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "after"
  },
  {
    "kind": "Variable",
    "name": "before",
    "variableName": "before"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  },
  {
    "kind": "Variable",
    "name": "last",
    "variableName": "last"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "usePrefetchableForwardPaginationFragmentEXPERIMENTALTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user"
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
      (v3/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "usePrefetchableForwardPaginationFragmentEXPERIMENTALTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v7/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v8/*: any*/),
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
                          (v7/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "name",
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
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "hasPreviousPage",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "startCursor",
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
                "args": (v8/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "UserFragment_friends",
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
    "cacheID": "6cd62bc50d478e401286fbd253466497",
    "id": null,
    "metadata": {},
    "name": "usePrefetchableForwardPaginationFragmentEXPERIMENTALTestQuery",
    "operationKind": "query",
    "text": "query usePrefetchableForwardPaginationFragmentEXPERIMENTALTestQuery(\n  $id: ID!\n  $after: ID\n  $first: Int\n  $before: ID\n  $last: Int\n) {\n  node(id: $id) {\n    __typename\n    ...usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user\n    id\n  }\n}\n\nfragment usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user on User {\n  friends(after: $after, first: $first, before: $before, last: $last) {\n    edges {\n      ...usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n  }\n  id\n}\n\nfragment usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges on FriendsEdge {\n  node {\n    id\n    name\n    __typename\n  }\n  cursor\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "48bd7cb20fb4977c3582b839ce846c1f";
}

module.exports = ((node/*: any*/)/*: Query<
  usePrefetchableForwardPaginationFragmentEXPERIMENTALTestQuery$variables,
  usePrefetchableForwardPaginationFragmentEXPERIMENTALTestQuery$data,
>*/);
