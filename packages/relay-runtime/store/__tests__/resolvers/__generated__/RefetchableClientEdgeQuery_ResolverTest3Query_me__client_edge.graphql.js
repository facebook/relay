/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9f9dc98e2dea2aa91bff4a3e6b91c837>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_ResolverTest3Query_me__client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_ResolverTest3Query_me__client_edge$variables = any;
export type RefetchableClientEdgeQuery_ResolverTest3Query_me__client_edge$data = {|
  +__typename: "User",
  +id: string,
  +$fragmentType: RefetchableClientEdgeQuery_ResolverTest3Query_me__client_edge$fragmentType,
|};
export type RefetchableClientEdgeQuery_ResolverTest3Query_me__client_edge$key = {
  +$data?: RefetchableClientEdgeQuery_ResolverTest3Query_me__client_edge$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_ResolverTest3Query_me__client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_ResolverTest3Query_me__client_edge.graphql'),
      "identifierField": "id"
    }
  },
  "name": "RefetchableClientEdgeQuery_ResolverTest3Query_me__client_edge",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
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
  (node/*: any*/).hash = "23af1732ca2b8848723c3de2d3c7231e";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_ResolverTest3Query_me__client_edge$fragmentType,
  RefetchableClientEdgeQuery_ResolverTest3Query_me__client_edge$data,
  ClientEdgeQuery_ResolverTest3Query_me__client_edge$variables,
>*/);
