/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ed05ecc56586b8fe1207cc2ea16da0dc>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { RelayResolverMixedInterfaceTestWheelsFragment$fragmentType } from "./RelayResolverMixedInterfaceTestWheelsFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$fragmentType: FragmentType;
type ClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$variables = any;
export type RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$data = {
  readonly id: string,
  readonly $fragmentSpreads: RelayResolverMixedInterfaceTestWheelsFragment$fragmentType,
  readonly $fragmentType: RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$fragmentType,
};
export type RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$key = {
  readonly $data?: RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$data,
  readonly $fragmentSpreads: RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$fragmentType,
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
      "operation": require('./ClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles",
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
  (node/*:: as any*/).hash = "d06dbd2f8539613d8ea5d82cf89ae318";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$fragmentType,
  RefetchableClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$data,
  ClientEdgeQuery_RelayResolverMixedInterfaceTestVehiclesQuery_vehicles$variables,
>*/);
