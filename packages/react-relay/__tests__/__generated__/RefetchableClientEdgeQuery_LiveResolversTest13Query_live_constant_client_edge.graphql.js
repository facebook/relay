/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d7701dcb310bcfd6ce6689c52581b325>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$variables = any;
export type RefetchableClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RefetchableClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$fragmentType,
|};
export type RefetchableClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$key = {
  +$data?: RefetchableClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge",
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
  (node/*: any*/).hash = "5e0a692af3d1acd9f3fbcb5fe00b0e77";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$fragmentType,
  RefetchableClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$data,
  ClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$variables,
>*/);
