/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8092a288cab9394d9f5cb5a5a08066b6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
type QueryResourceClientEdgesTestUser1Fragment$fragmentType = any;
type QueryResourceClientEdgesTestUser2Fragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$variables = any;
export type RefetchableClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$data = {|
  +id: string,
  +$fragmentSpreads: QueryResourceClientEdgesTestUser1Fragment$fragmentType & QueryResourceClientEdgesTestUser2Fragment$fragmentType,
  +$fragmentType: RefetchableClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$fragmentType,
|};
export type RefetchableClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$key = {
  +$data?: RefetchableClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$fragmentType,
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
      "operation": require('./ClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge.graphql'),
      "identifierField": "id"
    }
  },
  "name": "RefetchableClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "QueryResourceClientEdgesTestUser1Fragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "QueryResourceClientEdgesTestUser2Fragment"
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
  (node/*: any*/).hash = "0e90f7bbad806fa00859d97367fe56b8";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$fragmentType,
  RefetchableClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$data,
  ClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge$variables,
>*/);
