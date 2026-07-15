/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3fc2ef820b999cdf9772ec08d8027df1>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { RelayResolverMixedInterfaceTestWheelsFragment$fragmentType } from "./RelayResolverMixedInterfaceTestWheelsFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$fragmentType: FragmentType;
type ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$variables = any;
export type RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$data = {
  readonly id: string,
  readonly $fragmentSpreads: RelayResolverMixedInterfaceTestWheelsFragment$fragmentType,
  readonly $fragmentType: RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$fragmentType,
};
export type RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$key = {
  readonly $data?: RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$data,
  readonly $fragmentSpreads: RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayResolverMixedInterfaceTestWheelsFragment"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Bicycle",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "b398e4b078628d62e66bd9d22f5886e2";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$fragmentType,
  RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$data,
  ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleQuery_vehicle$variables,
>*/);
