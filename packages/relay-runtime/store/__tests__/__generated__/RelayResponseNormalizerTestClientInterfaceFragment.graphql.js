/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2203425d80706e29795c81001fb37e5f>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTestClientInterfaceFragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTestClientInterfaceFragment$data = {|
  +description: ?string,
  +$fragmentType: RelayResponseNormalizerTestClientInterfaceFragment$fragmentType,
|};
export type RelayResponseNormalizerTestClientInterfaceFragment$key = {
  +$data?: RelayResponseNormalizerTestClientInterfaceFragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTestClientInterfaceFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTestClientInterfaceFragment",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "description",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "ClientInterface",
  "abstractKey": "__isClientInterface"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "8750bf96f36b4fbad1dd3506ec7d4c1d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayResponseNormalizerTestClientInterfaceFragment$fragmentType,
  RelayResponseNormalizerTestClientInterfaceFragment$data,
>*/);
