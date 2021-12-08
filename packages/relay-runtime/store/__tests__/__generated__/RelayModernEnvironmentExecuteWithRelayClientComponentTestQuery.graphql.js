/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b9527fab32377ef8748a24bfd685a0dc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @ReactFlightClientDependency RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$normalization.graphql

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$fragmentType = any;
export type RelayModernEnvironmentExecuteWithRelayClientComponentTestQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithRelayClientComponentTestQueryVariables = RelayModernEnvironmentExecuteWithRelayClientComponentTestQuery$variables;
export type RelayModernEnvironmentExecuteWithRelayClientComponentTestQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteWithRelayClientComponentTestQueryResponse = RelayModernEnvironmentExecuteWithRelayClientComponentTestQuery$data;
export type RelayModernEnvironmentExecuteWithRelayClientComponentTestQuery = {|
  variables: RelayModernEnvironmentExecuteWithRelayClientComponentTestQueryVariables,
  response: RelayModernEnvironmentExecuteWithRelayClientComponentTestQuery$data,
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
    "name": "RelayModernEnvironmentExecuteWithRelayClientComponentTestQuery",
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
            "name": "RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment"
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
    "name": "RelayModernEnvironmentExecuteWithRelayClientComponentTestQuery",
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
            "fragment": require('./RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$normalization.graphql'),
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
    "cacheID": "07ae87a9f65ccf4bcb38dbf960d82515",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithRelayClientComponentTestQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithRelayClientComponentTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment @relay_client_component_server(module_id: \"RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment$normalization.graphql\")\n    id\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithRelayClientComponentTest_clientFragment on Story {\n  name\n  body {\n    text\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7bf230bc939d43ce10e55e7a2cc0af8e";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithRelayClientComponentTestQuery$variables,
  RelayModernEnvironmentExecuteWithRelayClientComponentTestQuery$data,
>*/);
