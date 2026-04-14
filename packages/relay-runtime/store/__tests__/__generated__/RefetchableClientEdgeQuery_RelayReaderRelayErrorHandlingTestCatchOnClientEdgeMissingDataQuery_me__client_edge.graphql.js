/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a352bdb74daf576434d5ee4f8999f4a3>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$variables = any;
export type RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$data = {|
  +firstName: ?string,
  +id: string,
  +$fragmentType: RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$fragmentType,
|};
export type RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$key = {
  +$data?: RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "firstName",
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
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "e2f870cb409863e7a5a038da3aed8d82";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$fragmentType,
  RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$data,
  ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$variables,
>*/);
