/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<77db5e18f415bf3e20790b92c3094537>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentEmptyTestFeatureFlagQuery$variables = {|
  cond: boolean,
|};
export type RelayModernEnvironmentEmptyTestFeatureFlagQuery$data = {|
  +me?: ?{|
    +id: string,
  |},
|};
export type RelayModernEnvironmentEmptyTestFeatureFlagQuery = {|
  response: RelayModernEnvironmentEmptyTestFeatureFlagQuery$data,
  variables: RelayModernEnvironmentEmptyTestFeatureFlagQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cond"
  }
],
v1 = [
  {
    "condition": "cond",
    "kind": "Condition",
    "passingValue": true,
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
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentEmptyTestFeatureFlagQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentEmptyTestFeatureFlagQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "fe07ac205945566838f7959d0667ba30",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentEmptyTestFeatureFlagQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentEmptyTestFeatureFlagQuery(\n  $cond: Boolean!\n) {\n  me @include(if: $cond) {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4ebf3871555c91bff9943cb9a41a4cb2";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentEmptyTestFeatureFlagQuery$variables,
  RelayModernEnvironmentEmptyTestFeatureFlagQuery$data,
>*/);
