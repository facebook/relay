/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<dfd4847df83d75e611690708e59c1023>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$variables = any;
export type RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$data = {|
  +firstName: ?string,
  +id: string,
  +$fragmentType: RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$fragmentType,
|};
export type RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$key = {
  +$data?: RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge",
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
  (node/*: any*/).hash = "d3fd8c798ab7357a229e7b8e79799744";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$fragmentType,
  RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$data,
  ClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$variables,
>*/);
