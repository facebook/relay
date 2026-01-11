/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<817bb72607ae2255e17fd8ba14fb0e9a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentEmptyTestIsEmptyQuery$variables = {|
  cond: boolean,
|};
export type RelayModernEnvironmentEmptyTestIsEmptyQuery$data = {|
  +me?: ?{|
    +id: string,
  |},
|};
export type RelayModernEnvironmentEmptyTestIsEmptyQuery = {|
  response: RelayModernEnvironmentEmptyTestIsEmptyQuery$data,
  variables: RelayModernEnvironmentEmptyTestIsEmptyQuery$variables,
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
    "name": "RelayModernEnvironmentEmptyTestIsEmptyQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentEmptyTestIsEmptyQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "5a4e6dfd0dfa440405515ff0eeffc44c",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentEmptyTestIsEmptyQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentEmptyTestIsEmptyQuery(\n  $cond: Boolean!\n) {\n  me @include(if: $cond) {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6f12a40e04f0b027d13b109faaa30894";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentEmptyTestIsEmptyQuery$variables,
  RelayModernEnvironmentEmptyTestIsEmptyQuery$data,
>*/);
