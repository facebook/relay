/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<226a0cdb23eb7b5c221a6700e57968fb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$variables = any;
export type RefetchableClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RefetchableClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$fragmentType,
|};
export type RefetchableClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$key = {
  +$data?: RefetchableClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge",
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
  (node/*: any*/).hash = "ffa93f1454a0796bf5a92612348c1069";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$fragmentType,
  RefetchableClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$data,
  ClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$variables,
>*/);
