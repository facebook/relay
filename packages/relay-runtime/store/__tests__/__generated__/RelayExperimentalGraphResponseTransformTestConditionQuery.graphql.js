/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9eccd1713096134c15cd489f9e9fe697>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayExperimentalGraphResponseTransformTest_condition$fragmentType } from "./RelayExperimentalGraphResponseTransformTest_condition.graphql";
export type RelayExperimentalGraphResponseTransformTestConditionQuery$variables = {|
  enableDefer: boolean,
  id: string,
|};
export type RelayExperimentalGraphResponseTransformTestConditionQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayExperimentalGraphResponseTransformTest_condition$fragmentType,
  |},
|};
export type RelayExperimentalGraphResponseTransformTestConditionQuery = {|
  response: RelayExperimentalGraphResponseTransformTestConditionQuery$data,
  variables: RelayExperimentalGraphResponseTransformTestConditionQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "enableDefer"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayExperimentalGraphResponseTransformTestConditionQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                "name": "RelayExperimentalGraphResponseTransformTest_condition"
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
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayExperimentalGraphResponseTransformTestConditionQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
            "if": "enableDefer",
            "kind": "Defer",
            "label": "RelayExperimentalGraphResponseTransformTestConditionQuery$defer$TestFragment",
            "selections": [
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
              }
            ]
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
    "cacheID": "75fe5327b6347c4e4e69e590249eabf7",
    "id": null,
    "metadata": {},
    "name": "RelayExperimentalGraphResponseTransformTestConditionQuery",
    "operationKind": "query",
    "text": "query RelayExperimentalGraphResponseTransformTestConditionQuery(\n  $id: ID!\n  $enableDefer: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayExperimentalGraphResponseTransformTest_condition @defer(label: \"RelayExperimentalGraphResponseTransformTestConditionQuery$defer$TestFragment\", if: $enableDefer)\n    id\n  }\n}\n\nfragment RelayExperimentalGraphResponseTransformTest_condition on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "43f766e8c0e9e4f2e6f15baa96299bd7";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayExperimentalGraphResponseTransformTestConditionQuery$variables,
  RelayExperimentalGraphResponseTransformTestConditionQuery$data,
>*/);
