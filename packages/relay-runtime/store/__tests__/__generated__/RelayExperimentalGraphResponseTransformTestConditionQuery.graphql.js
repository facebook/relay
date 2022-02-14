/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8eb179bd0cb1b88cecdbe455ada4d003>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayExperimentalGraphResponseTransformTest_condition$fragmentType = any;
export type RelayExperimentalGraphResponseTransformTestConditionQuery$variables = {|
  id: string,
  enableDefer: boolean,
|};
export type RelayExperimentalGraphResponseTransformTestConditionQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayExperimentalGraphResponseTransformTest_condition$fragmentType,
  |},
|};
export type RelayExperimentalGraphResponseTransformTestConditionQuery = {|
  variables: RelayExperimentalGraphResponseTransformTestConditionQuery$variables,
  response: RelayExperimentalGraphResponseTransformTestConditionQuery$data,
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
  (node/*: any*/).hash = "6d02d262365a960c063af8b116377d2a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayExperimentalGraphResponseTransformTestConditionQuery$variables,
  RelayExperimentalGraphResponseTransformTestConditionQuery$data,
>*/);
