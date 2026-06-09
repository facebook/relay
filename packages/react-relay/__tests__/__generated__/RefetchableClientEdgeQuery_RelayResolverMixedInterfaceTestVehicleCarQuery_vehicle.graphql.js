/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5d7c173bbc77c20bb3c11bd52bb53285>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { RelayResolverMixedInterfaceTestWheelsFragment$fragmentType } from "./RelayResolverMixedInterfaceTestWheelsFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleCarQuery_vehicle$fragmentType: FragmentType;
type ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleCarQuery_vehicle$variables = any;
export type RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleCarQuery_vehicle$data = {
  readonly id: string,
  readonly $fragmentSpreads: RelayResolverMixedInterfaceTestWheelsFragment$fragmentType,
  readonly $fragmentType: RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleCarQuery_vehicle$fragmentType,
};
export type RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleCarQuery_vehicle$key = {
  readonly $data?: RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleCarQuery_vehicle$data,
  readonly $fragmentSpreads: RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleCarQuery_vehicle$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleCarQuery_vehicle.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleCarQuery_vehicle",
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
  (node/*:: as any*/).hash = "eb5c1236e75f3eca65be34aa6a4c7fe4";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleCarQuery_vehicle$fragmentType,
  RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleCarQuery_vehicle$data,
  ClientEdgeQuery_RelayResolverMixedInterfaceTestVehicleCarQuery_vehicle$variables,
>*/);
