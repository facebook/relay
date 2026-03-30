/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2f4b7ca7b0af3bcb011d87a54782b222>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernOperationDescriptorTestCycleQuery$variables = {|
  id: string,
|};
export type RelayModernOperationDescriptorTestCycleQuery$data = {|
  +node: ?{|
    +__typename: string,
  |},
|};
export type RelayModernOperationDescriptorTestCycleQuery = {|
  response: RelayModernOperationDescriptorTestCycleQuery$data,
  variables: RelayModernOperationDescriptorTestCycleQuery$variables,
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernOperationDescriptorTestCycleQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayModernOperationDescriptorTestCycleQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
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
    "cacheID": "00554a6bc4095d75f2e720251f248d8f",
    "id": null,
    "metadata": {},
    "name": "RelayModernOperationDescriptorTestCycleQuery",
    "operationKind": "query",
    "text": "query RelayModernOperationDescriptorTestCycleQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "4cc0b085dfd315934b7f2a5d90b2119b";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernOperationDescriptorTestCycleQuery$variables,
  RelayModernOperationDescriptorTestCycleQuery$data,
>*/);
