/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7d226ab4066fd4707d5cc2861b68afec>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest5119NoSkipFragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest5119NoSkipFragment$data = {|
  +firstName: ?string,
  +$fragmentType: RelayResponseNormalizerTest5119NoSkipFragment$fragmentType,
|};
export type RelayResponseNormalizerTest5119NoSkipFragment$key = {
  +$data?: RelayResponseNormalizerTest5119NoSkipFragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTest5119NoSkipFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest5119NoSkipFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "firstName",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "f0666b78b52cbf6d9c149dc4a9d22b53";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayResponseNormalizerTest5119NoSkipFragment$fragmentType,
  RelayResponseNormalizerTest5119NoSkipFragment$data,
>*/);
