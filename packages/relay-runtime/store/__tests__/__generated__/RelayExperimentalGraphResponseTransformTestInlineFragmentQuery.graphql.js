/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<25d7737bd2cd7f22ef6725717bc28b10>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayExperimentalGraphResponseTransformTestInlineFragmentQuery$variables = {||};
export type RelayExperimentalGraphResponseTransformTestInlineFragmentQuery$data = {|
  +node: ?{|
    +name?: ?string,
  |},
|};
export type RelayExperimentalGraphResponseTransformTestInlineFragmentQuery = {|
  response: RelayExperimentalGraphResponseTransformTestInlineFragmentQuery$data,
  variables: RelayExperimentalGraphResponseTransformTestInlineFragmentQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "10"
  }
],
v1 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayExperimentalGraphResponseTransformTestInlineFragmentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*:: as any*/)
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
    "name": "RelayExperimentalGraphResponseTransformTestInlineFragmentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
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
          (v1/*:: as any*/),
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
    "cacheID": "77087df9695f8e0e3ce94fb3f601dc31",
    "id": null,
    "metadata": {},
    "name": "RelayExperimentalGraphResponseTransformTestInlineFragmentQuery",
    "operationKind": "query",
    "text": "query RelayExperimentalGraphResponseTransformTestInlineFragmentQuery {\n  node(id: \"10\") {\n    __typename\n    ... on User {\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "42a447a6c3a544c51e72c85d5f0ad861";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayExperimentalGraphResponseTransformTestInlineFragmentQuery$variables,
  RelayExperimentalGraphResponseTransformTestInlineFragmentQuery$data,
>*/);
