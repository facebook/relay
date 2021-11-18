/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d8b2d488c64bde2cf3dafc0110d14664>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTestActorChangeFragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTestActorChangeFragment$ref = RelayResponseNormalizerTestActorChangeFragment$fragmentType;
export type RelayResponseNormalizerTestActorChangeFragment$data = {|
  +name: ?string,
  +$fragmentType: RelayResponseNormalizerTestActorChangeFragment$fragmentType,
|};
export type RelayResponseNormalizerTestActorChangeFragment = RelayResponseNormalizerTestActorChangeFragment$data;
export type RelayResponseNormalizerTestActorChangeFragment$key = {
  +$data?: RelayResponseNormalizerTestActorChangeFragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTestActorChangeFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTestActorChangeFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "7293585078e62a27bf079936a4b80599";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTestActorChangeFragment$fragmentType,
  RelayResponseNormalizerTestActorChangeFragment$data,
>*/);
