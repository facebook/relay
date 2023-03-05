/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f9b77f003d6b2c531300c97adeec151b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { RelayReaderClientEdgesTestFragmentOnUser$fragmentType } from "./RelayReaderClientEdgesTestFragmentOnUser.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayReaderClientEdgesTest3Query_me__client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_RelayReaderClientEdgesTest3Query_me__client_edge$variables = any;
export type RefetchableClientEdgeQuery_RelayReaderClientEdgesTest3Query_me__client_edge$data = {|
  +id: string,
  +$fragmentSpreads: RelayReaderClientEdgesTestFragmentOnUser$fragmentType,
  +$fragmentType: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest3Query_me__client_edge$fragmentType,
|};
export type RefetchableClientEdgeQuery_RelayReaderClientEdgesTest3Query_me__client_edge$key = {
  +$data?: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest3Query_me__client_edge$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest3Query_me__client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayReaderClientEdgesTest3Query_me__client_edge.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayReaderClientEdgesTest3Query_me__client_edge",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayReaderClientEdgesTestFragmentOnUser"
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
  (node/*: any*/).hash = "1631a4297aeb4909e68ea6822af044cb";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_RelayReaderClientEdgesTest3Query_me__client_edge$fragmentType,
  RefetchableClientEdgeQuery_RelayReaderClientEdgesTest3Query_me__client_edge$data,
  ClientEdgeQuery_RelayReaderClientEdgesTest3Query_me__client_edge$variables,
>*/);
