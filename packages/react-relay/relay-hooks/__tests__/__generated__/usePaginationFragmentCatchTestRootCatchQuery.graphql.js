/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a56a5026fa3257ec3400e9702b37b823>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { usePaginationFragmentCatchTestRootCatchFragment$fragmentType } from "./usePaginationFragmentCatchTestRootCatchFragment.graphql";
export type usePaginationFragmentCatchTestRootCatchQuery$variables = {|
  after?: ?string,
  first?: ?number,
|};
export type usePaginationFragmentCatchTestRootCatchQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: usePaginationFragmentCatchTestRootCatchFragment$fragmentType,
  |},
|};
export type usePaginationFragmentCatchTestRootCatchQuery = {|
  response: usePaginationFragmentCatchTestRootCatchQuery$data,
  variables: usePaginationFragmentCatchTestRootCatchQuery$variables,
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
  "name": "first"
},
v2 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "after"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "usePaginationFragmentCatchTestRootCatchQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "usePaginationFragmentCatchTestRootCatchFragment"
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
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "usePaginationFragmentCatchTestRootCatchQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*:: as any*/),
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
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      },
                      (v3/*:: as any*/)
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
            "args": (v2/*:: as any*/),
            "filters": null,
            "handle": "connection",
            "key": "usePaginationFragmentCatchTestRootCatchFragment__friends",
            "kind": "LinkedHandle",
            "name": "friends"
          },
          (v3/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d53c12bd36c54efda0155d644e3f59c9",
    "id": null,
    "metadata": {},
    "name": "usePaginationFragmentCatchTestRootCatchQuery",
    "operationKind": "query",
    "text": "query usePaginationFragmentCatchTestRootCatchQuery(\n  $first: Int\n  $after: ID\n) {\n  me {\n    ...usePaginationFragmentCatchTestRootCatchFragment\n    id\n  }\n}\n\nfragment usePaginationFragmentCatchTestRootCatchFragment on User {\n  friends(after: $after, first: $first) {\n    edges {\n      node {\n        __typename\n        id\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "f1acf4cfb88f6703a6d7d8fcf0c39c70";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  usePaginationFragmentCatchTestRootCatchQuery$variables,
  usePaginationFragmentCatchTestRootCatchQuery$data,
>*/);
