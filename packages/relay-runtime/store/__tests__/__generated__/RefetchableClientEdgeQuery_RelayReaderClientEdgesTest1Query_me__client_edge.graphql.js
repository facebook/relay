/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1c3802a11b3c43edbd60a1310b4ae15f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$variables = any;
export type RefetchableClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$fragmentType,
|};
export type RefetchableClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$key = {
  +$data?: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge",
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
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "6c1083daaac4ea12e10cc69caf7e3983";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$fragmentType,
  RefetchableClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$data,
  ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge$variables,
>*/);
