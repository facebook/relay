/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0e330b9eac986dda5c408c67389cf851>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @ReactFlightClientDependency RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$normalization.graphql

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$ref = any;
export type RelayModernEnvironmentExecuteWithFlightAndClientFragmentTestInnerQueryVariables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithFlightAndClientFragmentTestInnerQueryResponse = {|
  +node: ?{|
    +$fragmentRefs: RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$ref,
  |},
|};
export type RelayModernEnvironmentExecuteWithFlightAndClientFragmentTestInnerQuery = {|
  variables: RelayModernEnvironmentExecuteWithFlightAndClientFragmentTestInnerQueryVariables,
  response: RelayModernEnvironmentExecuteWithFlightAndClientFragmentTestInnerQueryResponse,
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithFlightAndClientFragmentTestInnerQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment"
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
    "name": "RelayModernEnvironmentExecuteWithFlightAndClientFragmentTestInnerQuery",
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
          {
            "args": null,
            "fragment": require('./RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$normalization.graphql'),
            "kind": "ClientComponent"
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
    "cacheID": "16a3c110f5321eb844d02c0421a2e253",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithFlightAndClientFragmentTestInnerQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithFlightAndClientFragmentTestInnerQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment @relay_client_component_server(module_id: \"RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment$normalization.graphql\")\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithFlightAndClientFragmentTest_clientFragment on Story {\n  name\n  body {\n    text\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "337f43907f43a7d61eed932a0bf7f0d2";
}

module.exports = node;
