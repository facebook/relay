/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a3c6d366adb1aba1ded17e42058d37c7>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { RelayResolverMixedUnionFetchableTestFragment$fragmentType } from "./RelayResolverMixedUnionFetchableTestFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestMissingQuery_mixed_vehicle$fragmentType: FragmentType;
type ClientEdgeQuery_RelayResolverMixedUnionFetchableTestMissingQuery_mixed_vehicle$variables = any;
export type RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestMissingQuery_mixed_vehicle$data = {
  readonly fetch_id: string,
  readonly $fragmentSpreads: RelayResolverMixedUnionFetchableTestFragment$fragmentType,
  readonly $fragmentType: RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestMissingQuery_mixed_vehicle$fragmentType,
};
export type RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestMissingQuery_mixed_vehicle$key = {
  readonly $data?: RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestMissingQuery_mixed_vehicle$data,
  readonly $fragmentSpreads: RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestMissingQuery_mixed_vehicle$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayResolverMixedUnionFetchableTestMissingQuery_mixed_vehicle.graphql'),
      "identifierInfo": {
        "identifierField": "fetch_id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestMissingQuery_mixed_vehicle",
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
  (node/*:: as any*/).hash = "4775dcf89ee38d0a31ea80d6a485e59a";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestMissingQuery_mixed_vehicle$fragmentType,
  RefetchableClientEdgeQuery_RelayResolverMixedUnionFetchableTestMissingQuery_mixed_vehicle$data,
  ClientEdgeQuery_RelayResolverMixedUnionFetchableTestMissingQuery_mixed_vehicle$variables,
>*/);
