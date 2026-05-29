/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<10bcfefc5ae50df37e50804fbba1b897>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$variables = any;
export type RefetchableClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$data = {
  readonly id: string,
  readonly name: ?string,
  readonly $fragmentType: RefetchableClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$fragmentType,
};
export type RefetchableClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$key = {
  readonly $data?: RefetchableClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$data,
  readonly $fragmentSpreads: RefetchableClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge",
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
  (node/*:: as any*/).hash = "145cd045d842ac7fe259d9f5210a67c1";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$fragmentType,
  RefetchableClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$data,
  ClientEdgeQuery_observeFragmentTestClientEdgeToServerFragment_client_edge$variables,
>*/);
