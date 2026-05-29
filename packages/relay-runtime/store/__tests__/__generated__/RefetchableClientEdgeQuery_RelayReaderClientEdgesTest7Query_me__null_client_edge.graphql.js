/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<70c6d1e69340782240166af3314d80e1>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayReaderClientEdgesTest7Query_me__null_client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_RelayReaderClientEdgesTest7Query_me__null_client_edge$variables = any;
export type RefetchableClientEdgeQuery_RelayReaderClientEdgesTest7Query_me__null_client_edge$data = {
  readonly id: string,
  readonly name: ?string,
  readonly $fragmentType: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest7Query_me__null_client_edge$fragmentType,
};
export type RefetchableClientEdgeQuery_RelayReaderClientEdgesTest7Query_me__null_client_edge$key = {
  readonly $data?: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest7Query_me__null_client_edge$data,
  readonly $fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest7Query_me__null_client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayReaderClientEdgesTest7Query_me__null_client_edge.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayReaderClientEdgesTest7Query_me__null_client_edge",
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
  (node/*:: as any*/).hash = "2bb6b1ba5045fb1a37b30e4f29e7b0df";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_RelayReaderClientEdgesTest7Query_me__null_client_edge$fragmentType,
  RefetchableClientEdgeQuery_RelayReaderClientEdgesTest7Query_me__null_client_edge$data,
  ClientEdgeQuery_RelayReaderClientEdgesTest7Query_me__null_client_edge$variables,
>*/);
