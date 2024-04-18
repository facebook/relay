/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<18c1629379503b0a197cf1f9e5ba94a6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResolverInterfaceTestWeakAnimalLegsFragment$fragmentType: FragmentType;
export type RelayResolverInterfaceTestWeakAnimalLegsFragment$data = {|
  +legs: ?number,
  +$fragmentType: RelayResolverInterfaceTestWeakAnimalLegsFragment$fragmentType,
|};
export type RelayResolverInterfaceTestWeakAnimalLegsFragment$key = {
  +$data?: RelayResolverInterfaceTestWeakAnimalLegsFragment$data,
  +$fragmentSpreads: RelayResolverInterfaceTestWeakAnimalLegsFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResolverInterfaceTestWeakAnimalLegsFragment",
  "selections": [
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
                "name": "Octopus____relay_model_instance"
              },
              "kind": "RelayResolver",
              "name": "legs",
              "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Octopus____relay_model_instance.graphql'), require('./../../../relay-runtime/store/__tests__/resolvers/OctopusResolvers').legs, '__relay_model_instance', true),
              "path": "legs"
            }
          ],
          "type": "Octopus",
          "abstractKey": null
        }
      ]
    }
  ],
  "type": "IWeakAnimal",
  "abstractKey": "__isIWeakAnimal"
};

if (__DEV__) {
  (node/*: any*/).hash = "e6c4e224d929f0e885844589283cc8f2";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResolverInterfaceTestWeakAnimalLegsFragment$fragmentType,
  RelayResolverInterfaceTestWeakAnimalLegsFragment$data,
>*/);
