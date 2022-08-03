/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b386747d0cd15c4c1ad5d68e7a090712>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentResourceClientEdgesTestFragment1$fragmentType } from "./FragmentResourceClientEdgesTestFragment1.graphql";
export type FragmentResourceClientEdgesTest1Query$variables = {|
  id: string,
|};
export type FragmentResourceClientEdgesTest1Query$data = {|
  +node: ?{|
    +__typename: string,
    +$fragmentSpreads: FragmentResourceClientEdgesTestFragment1$fragmentType,
  |},
|};
export type FragmentResourceClientEdgesTest1Query = {|
  response: FragmentResourceClientEdgesTest1Query$data,
  variables: FragmentResourceClientEdgesTest1Query$variables,
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FragmentResourceClientEdgesTest1Query",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "FragmentResourceClientEdgesTestFragment1"
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
    "name": "FragmentResourceClientEdgesTest1Query",
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
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d0fde6b32386969d80bd4afc2e17acb7",
    "id": null,
    "metadata": {},
    "name": "FragmentResourceClientEdgesTest1Query",
    "operationKind": "query",
    "text": "query FragmentResourceClientEdgesTest1Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...FragmentResourceClientEdgesTestFragment1\n    id\n  }\n}\n\nfragment FragmentResourceClientEdgesTestFragment1 on User {\n  ...UserClientEdgeResolver\n}\n\nfragment UserClientEdgeResolver on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a45d5fe34c226d737ff1adb0205a4141";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceClientEdgesTest1Query$variables,
  FragmentResourceClientEdgesTest1Query$data,
>*/);
