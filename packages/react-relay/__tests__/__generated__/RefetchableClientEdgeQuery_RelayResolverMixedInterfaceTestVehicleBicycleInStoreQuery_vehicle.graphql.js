/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<265d5ae55a0b50af40d935726664786c>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { RelayResolverMixedInterfaceTestWheelsFragment$fragmentType } from "./RelayResolverMixedInterfaceTestWheelsFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery_vehicle$fragmentType: FragmentType;
type ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery_vehicle$variables = any;
export type RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery_vehicle$data = {
  readonly id: string,
  readonly $fragmentSpreads: RelayResolverMixedInterfaceTestWheelsFragment$fragmentType,
  readonly $fragmentType: RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery_vehicle$fragmentType,
};
export type RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery_vehicle$key = {
  readonly $data?: RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery_vehicle$data,
  readonly $fragmentSpreads: RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery_vehicle$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery_vehicle.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery_vehicle",
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
  (node/*:: as any*/).hash = "7f1d34def3f8791d59fcb580942d28e7";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery_vehicle$fragmentType,
  RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery_vehicle$data,
  ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleBicycleInStoreQuery_vehicle$variables,
>*/);
