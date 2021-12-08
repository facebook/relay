/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<abb6071af6b4f8df318cc6ec9482dbd9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQueryVariables = RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery$variables;
export type RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery$data = {|
  +node: ?{|
    +name?: ?string,
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQueryResponse = RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery$data;
export type RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery = {|
  variables: RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQueryVariables,
  response: RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery$data,
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/)
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
    "name": "RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery",
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
          (v2/*: any*/),
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
    "cacheID": "f62b1d65d77831be7e666ea04fbcf8e9",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "09a947eb9531ea2baf54ad751801b7f8";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery$variables,
  RelayModernEnvironmentExecuteMutationWithFlightTest_InnerQuery$data,
>*/);
