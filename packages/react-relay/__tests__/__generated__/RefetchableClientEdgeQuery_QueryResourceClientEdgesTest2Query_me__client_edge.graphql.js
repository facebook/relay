/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<294905380e1d78aa11cb855086aa97bc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { QueryResourceClientEdgesTestUser1Fragment$fragmentType } from "./QueryResourceClientEdgesTestUser1Fragment.graphql";
import type { QueryResourceClientEdgesTestUser2Fragment$fragmentType } from "./QueryResourceClientEdgesTestUser2Fragment.graphql";
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
