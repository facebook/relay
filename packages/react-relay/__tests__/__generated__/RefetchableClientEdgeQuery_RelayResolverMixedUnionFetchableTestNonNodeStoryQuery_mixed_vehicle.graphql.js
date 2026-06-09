/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2f7ffa4c9bd1741c3350ba2480347c8f>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { RelayResolverMixedUnionFetchableTestFragment$fragmentType } from "./RelayResolverMixedUnionFetchableTestFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestNonNodeStoryQuery_mixed_vehicle$fragmentType: FragmentType;
type ClientEdgeQuery_RelayResolverMixedUnionFetchableTestNonNodeStoryQuery_mixed_vehicle$variables = any;
export type RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestNonNodeStoryQuery_mixed_vehicle$data = {
  readonly fetch_id: string,
  readonly $fragmentSpreads: RelayResolverMixedUnionFetchableTestFragment$fragmentType,
  readonly $fragmentType: RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestNonNodeStoryQuery_mixed_vehicle$fragmentType,
};
export type RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestNonNodeStoryQuery_mixed_vehicle$key = {
  readonly $data?: RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestNonNodeStoryQuery_mixed_vehicle$data,
  readonly $fragmentSpreads: RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestNonNodeStoryQuery_mixed_vehicle$fragmentType,
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
        "fetch__NonNodeStory"
      ],
      "operation": require('./ClientEdgeQuery_RelayResolverMixedUnionFetchableTestNonNodeStoryQuery_mixed_vehicle.graphql'),
      "identifierInfo": {
        "identifierField": "fetch_id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestNonNodeStoryQuery_mixed_vehicle",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayResolverMixedUnionFetchableTestFragment"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "fetch_id",
      "storageKey": null
    }
  ],
  "type": "NonNodeStory",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "570527472dcc16ea924b133ebd10a35d";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestNonNodeStoryQuery_mixed_vehicle$fragmentType,
  RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestNonNodeStoryQuery_mixed_vehicle$data,
  ClientEdgeQuery_RelayResolverMixedUnionFetchableTestNonNodeStoryQuery_mixed_vehicle$variables,
>*/);
