/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a47897b6a05efdfc2380835745edde7c>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResolverMixedInterfaceTestWheelsFragment$fragmentType: FragmentType;
export type RelayResolverMixedInterfaceTestWheelsFragment$data = {
  readonly wheels: ?number,
  readonly $fragmentType: RelayResolverMixedInterfaceTestWheelsFragment$fragmentType,
};
export type RelayResolverMixedInterfaceTestWheelsFragment$key = {
  readonly $data?: RelayResolverMixedInterfaceTestWheelsFragment$data,
  readonly $fragmentSpreads: RelayResolverMixedInterfaceTestWheelsFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResolverMixedInterfaceTestWheelsFragment",
  "selections": [
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "wheels",
          "storageKey": null
        }
      ],
      "type": "Bicycle",
      "abstractKey": null
    },
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "fragment": {
                "args": null,
                "kind": "FragmentSpread",
                "name": "Car____relay_model_instance"
              },
              "kind": "RelayResolver",
              "name": "wheels",
              "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./Car____relay_model_instance.graphql'), require('../RelayResolverMixedInterface-test').wheels, '__relay_model_instance', true),
              "path": "wheels"
            }
          ],
          "type": "Car",
          "abstractKey": null
        }
      ]
    }
  ],
  "type": "IVehicle",
  "abstractKey": "__isIVehicle"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "360a6357eadccba3b8b5644e6c87c77c";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayResolverMixedInterfaceTestWheelsFragment$fragmentType,
  RelayResolverMixedInterfaceTestWheelsFragment$data,
>*/);
