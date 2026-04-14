/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<24c5c12213d0c55670c93abdf07b5ccf>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$variables = any;
export type RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$data = {|
  +firstName: ?string,
  +id: string,
  +$fragmentType: RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$fragmentType,
|};
export type RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$key = {
  +$data?: RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge",
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
  (node/*:: as any*/).hash = "c386403954c3fa0f065c7db6580ee9cc";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$fragmentType,
  RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$data,
  ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$variables,
>*/);
