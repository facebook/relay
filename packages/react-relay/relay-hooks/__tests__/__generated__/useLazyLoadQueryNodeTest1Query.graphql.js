/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2a197f4fec9a47a0a82d656e9f19d028>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useLazyLoadQueryNodeTestDeferFragment$fragmentType } from "./useLazyLoadQueryNodeTestDeferFragment.graphql";
export type useLazyLoadQueryNodeTest1Query$variables = {|
  id?: ?string,
|};
export type useLazyLoadQueryNodeTest1Query$data = {|
  +node: ?{|
    +$fragmentSpreads: useLazyLoadQueryNodeTestDeferFragment$fragmentType,
  |},
|};
export type useLazyLoadQueryNodeTest1Query = {|
  response: useLazyLoadQueryNodeTest1Query$data,
  variables: useLazyLoadQueryNodeTest1Query$variables,
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
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useLazyLoadQueryNodeTest1Query",
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
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "useLazyLoadQueryNodeTestDeferFragment"
              }
            ]
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
    "name": "useLazyLoadQueryNodeTest1Query",
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
            "if": null,
            "kind": "Defer",
            "label": "useLazyLoadQueryNodeTest1Query$defer$useLazyLoadQueryNodeTestDeferFragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  }
                ],
                "type": "User",
                "abstractKey": null
              }
            ]
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f24ea1695f1b749ecb5862c7b0d38be1",
    "id": null,
    "metadata": {},
    "name": "useLazyLoadQueryNodeTest1Query",
    "operationKind": "query",
    "text": "query useLazyLoadQueryNodeTest1Query(\n  $id: ID\n) {\n  node(id: $id) {\n    __typename\n    ...useLazyLoadQueryNodeTestDeferFragment @defer(label: \"useLazyLoadQueryNodeTest1Query$defer$useLazyLoadQueryNodeTestDeferFragment\")\n    id\n  }\n}\n\nfragment useLazyLoadQueryNodeTestDeferFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "021b10a8f84891aa446aeda4b318a341";
}

module.exports = ((node/*: any*/)/*: Query<
  useLazyLoadQueryNodeTest1Query$variables,
  useLazyLoadQueryNodeTest1Query$data,
>*/);
