/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<60125d32241cf65934e5ef02cdef557a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentEmptyTestExecuteQuery$variables = {|
  cond: boolean,
|};
export type RelayModernEnvironmentEmptyTestExecuteQuery$data = {|
  +me?: ?{|
    +id: string,
  |},
|};
export type RelayModernEnvironmentEmptyTestExecuteQuery = {|
  response: RelayModernEnvironmentEmptyTestExecuteQuery$data,
  variables: RelayModernEnvironmentEmptyTestExecuteQuery$variables,
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
    "name": "RelayModernEnvironmentEmptyTestExecuteQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentEmptyTestExecuteQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "80ef368915c3bbe14149098516d1a523",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentEmptyTestExecuteQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentEmptyTestExecuteQuery(\n  $cond: Boolean!\n) {\n  me @include(if: $cond) {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "bc3ea144363ded70454d036d485e3d7e";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentEmptyTestExecuteQuery$variables,
  RelayModernEnvironmentEmptyTestExecuteQuery$data,
>*/);
