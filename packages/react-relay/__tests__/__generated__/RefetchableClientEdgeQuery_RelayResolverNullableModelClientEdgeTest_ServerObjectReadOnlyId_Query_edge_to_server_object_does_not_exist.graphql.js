/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a22cd26090ff261879581213dfe79ddc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$fragmentType: FragmentType;
type ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$variables = any;
export type RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$data = {|
  +id: string,
  +$fragmentType: RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$fragmentType,
|};
export type RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$key = {
  +$data?: RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Comment",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "6e6fc82ab5969e84d7c748516d16686b";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$fragmentType,
  RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$data,
  ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$variables,
>*/);
