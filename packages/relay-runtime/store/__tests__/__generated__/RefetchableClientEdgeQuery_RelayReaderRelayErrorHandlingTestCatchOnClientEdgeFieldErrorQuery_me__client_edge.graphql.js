/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<dadf93ed69cb35a89bf72bdd70f1f53e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$variables = any;
export type RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$data = {|
  +id: string,
  +lastName: ?string,
  +$fragmentType: RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$fragmentType,
|};
export type RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$key = {
  +$data?: RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lastName",
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
  (node/*:: as any*/).hash = "5c9ed84fff2ab3847198237e2d752e9e";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$fragmentType,
  RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$data,
  ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$variables,
>*/);
