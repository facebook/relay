/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f77c3f23c9e10531b2eeaf50efce1ceb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResolverInterfaceTestWeakAnimalColorFragment$fragmentType: FragmentType;
export type RelayResolverInterfaceTestWeakAnimalColorFragment$data = {|
  +color: ?string,
  +$fragmentType: RelayResolverInterfaceTestWeakAnimalColorFragment$fragmentType,
|};
export type RelayResolverInterfaceTestWeakAnimalColorFragment$key = {
  +$data?: RelayResolverInterfaceTestWeakAnimalColorFragment$data,
  +$fragmentSpreads: RelayResolverInterfaceTestWeakAnimalColorFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResolverInterfaceTestWeakAnimalColorFragment",
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
                "name": "PurpleOctopus____relay_model_instance"
              },
              "kind": "RelayResolver",
              "name": "color",
              "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/PurpleOctopus____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/PurpleOctopusResolvers').color, '__relay_model_instance', true),
              "path": "color"
            }
          ],
          "type": "PurpleOctopus",
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
                "name": "RedOctopus____relay_model_instance"
              },
              "kind": "RelayResolver",
              "name": "color",
              "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/RedOctopus____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/RedOctopusResolvers').color, '__relay_model_instance', true),
              "path": "color"
            }
          ],
          "type": "RedOctopus",
          "abstractKey": null
        }
      ]
    }
  ],
  "type": "IWeakAnimal",
  "abstractKey": "__isIWeakAnimal"
};

if (__DEV__) {
  (node/*: any*/).hash = "3f50d51aac998df03ff67ac9a677b0c5";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResolverInterfaceTestWeakAnimalColorFragment$fragmentType,
  RelayResolverInterfaceTestWeakAnimalColorFragment$data,
>*/);
