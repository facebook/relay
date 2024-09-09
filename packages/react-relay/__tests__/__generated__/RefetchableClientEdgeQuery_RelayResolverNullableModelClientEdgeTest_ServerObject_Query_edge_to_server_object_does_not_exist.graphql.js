/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<011095a988ef3a992d94871df730045c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObject_Query_edge_to_server_object_does_not_exist$fragmentType: FragmentType;
type ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObject_Query_edge_to_server_object_does_not_exist$variables = any;
export type RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObject_Query_edge_to_server_object_does_not_exist$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObject_Query_edge_to_server_object_does_not_exist$fragmentType,
|};
export type RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObject_Query_edge_to_server_object_does_not_exist$key = {
  +$data?: RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObject_Query_edge_to_server_object_does_not_exist$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObject_Query_edge_to_server_object_does_not_exist$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObject_Query_edge_to_server_object_does_not_exist.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObject_Query_edge_to_server_object_does_not_exist",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
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
  (node/*: any*/).hash = "3990dc068bf228226a21832b04bbd39a";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObject_Query_edge_to_server_object_does_not_exist$fragmentType,
  RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObject_Query_edge_to_server_object_does_not_exist$data,
  ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObject_Query_edge_to_server_object_does_not_exist$variables,
>*/);
