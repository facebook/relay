/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7b62202591e6eb6fbb653a813be7e9b1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayExperimentalGraphResponseTransformTest_user_name$fragmentType } from "./RelayExperimentalGraphResponseTransformTest_user_name.graphql";
export type RelayExperimentalGraphResponseTransformTestFragmentSpreadQuery$variables = {||};
export type RelayExperimentalGraphResponseTransformTestFragmentSpreadQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayExperimentalGraphResponseTransformTest_user_name$fragmentType,
  |},
|};
export type RelayExperimentalGraphResponseTransformTestFragmentSpreadQuery = {|
  response: RelayExperimentalGraphResponseTransformTestFragmentSpreadQuery$data,
  variables: RelayExperimentalGraphResponseTransformTestFragmentSpreadQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "10"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayExperimentalGraphResponseTransformTestFragmentSpreadQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayExperimentalGraphResponseTransformTest_user_name"
          }
        ],
        "storageKey": "node(id:\"10\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayExperimentalGraphResponseTransformTestFragmentSpreadQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
        "storageKey": "node(id:\"10\")"
      }
    ]
  },
  "params": {
    "cacheID": "1358d859480cdf7a04523575327a04fc",
    "id": null,
    "metadata": {},
    "name": "RelayExperimentalGraphResponseTransformTestFragmentSpreadQuery",
    "operationKind": "query",
    "text": "query RelayExperimentalGraphResponseTransformTestFragmentSpreadQuery {\n  node(id: \"10\") {\n    __typename\n    ...RelayExperimentalGraphResponseTransformTest_user_name\n    id\n  }\n}\n\nfragment RelayExperimentalGraphResponseTransformTest_user_name on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "106c74251d41691aaeeadf9000b01b0b";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayExperimentalGraphResponseTransformTestFragmentSpreadQuery$variables,
  RelayExperimentalGraphResponseTransformTestFragmentSpreadQuery$data,
>*/);
