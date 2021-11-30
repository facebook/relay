/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e493745b8ee72b12fc1ad2a6852c142c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @ReactFlightClientDependency RelayResponseNormalizerTest_clientFragment$normalization.graphql

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayResponseNormalizerTest_clientFragment$fragmentType = any;
export type RelayResponseNormalizerTestServerOrClientQuery$variables = {|
  id: string,
|};
export type RelayResponseNormalizerTestServerOrClientQueryVariables = RelayResponseNormalizerTestServerOrClientQuery$variables;
export type RelayResponseNormalizerTestServerOrClientQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayResponseNormalizerTest_clientFragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTestServerOrClientQueryResponse = RelayResponseNormalizerTestServerOrClientQuery$data;
export type RelayResponseNormalizerTestServerOrClientQuery = {|
  variables: RelayResponseNormalizerTestServerOrClientQueryVariables,
  response: RelayResponseNormalizerTestServerOrClientQuery$data,
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
    "name": "RelayResponseNormalizerTestServerOrClientQuery",
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
            "name": "RelayResponseNormalizerTest_clientFragment"
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
    "name": "RelayResponseNormalizerTestServerOrClientQuery",
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
            "fragment": require('./RelayResponseNormalizerTest_clientFragment$normalization.graphql'),
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
    "cacheID": "50369b33d8ddd327912866577ac3722e",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTestServerOrClientQuery",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTestServerOrClientQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayResponseNormalizerTest_clientFragment @relay_client_component_server(module_id: \"RelayResponseNormalizerTest_clientFragment$normalization.graphql\")\n    id\n  }\n}\n\nfragment RelayResponseNormalizerTest_clientFragment on Story {\n  name\n  body {\n    text\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a0dd4ee40f4cb0fc29cc2dc260f83cde";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTestServerOrClientQuery$variables,
  RelayResponseNormalizerTestServerOrClientQuery$data,
>*/);
