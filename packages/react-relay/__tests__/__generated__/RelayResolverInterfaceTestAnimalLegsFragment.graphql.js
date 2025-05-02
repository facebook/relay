/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c8d567baef98c764dea4ef208010ca94>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResolverInterfaceTestAnimalLegsFragment$fragmentType: FragmentType;
export type RelayResolverInterfaceTestAnimalLegsFragment$data = {|
  +legs: ?number,
  +$fragmentType: RelayResolverInterfaceTestAnimalLegsFragment$fragmentType,
|};
export type RelayResolverInterfaceTestAnimalLegsFragment$key = {
  +$data?: RelayResolverInterfaceTestAnimalLegsFragment$data,
  +$fragmentSpreads: RelayResolverInterfaceTestAnimalLegsFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResolverInterfaceTestAnimalLegsFragment",
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
              "kind": "ScalarField",
              "name": "legs",
              "storageKey": null
            }
          ],
          "type": "Chicken",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "fragment": {
                "args": null,
                "kind": "FragmentSpread",
                "name": "Cat____relay_model_instance"
              },
              "kind": "RelayResolver",
              "name": "legs",
              "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Cat____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/CatResolvers').legs, '__relay_model_instance', true),
              "path": "legs"
            }
          ],
          "type": "Cat",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "fragment": {
                "args": null,
                "kind": "FragmentSpread",
                "name": "Fish____relay_model_instance"
              },
              "kind": "RelayResolver",
              "name": "legs",
              "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Fish____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/FishResolvers').legs, '__relay_model_instance', true),
              "path": "legs"
            }
          ],
          "type": "Fish",
          "abstractKey": null
        }
      ]
    }
  ],
  "type": "IAnimal",
  "abstractKey": "__isIAnimal"
};

if (__DEV__) {
  (node/*: any*/).hash = "30ed1535c07e810fa0c28b4a7be25a81";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResolverInterfaceTestAnimalLegsFragment$fragmentType,
  RelayResolverInterfaceTestAnimalLegsFragment$data,
>*/);
