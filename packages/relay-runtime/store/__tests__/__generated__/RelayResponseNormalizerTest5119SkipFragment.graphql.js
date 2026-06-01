/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d0519239d45eabf6dff5fa5d20e71d76>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest5119SkipFragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest5119SkipFragment$data = {|
  +firstName?: ?string,
  +$fragmentType: RelayResponseNormalizerTest5119SkipFragment$fragmentType,
|};
export type RelayResponseNormalizerTest5119SkipFragment$key = {
  +$data?: RelayResponseNormalizerTest5119SkipFragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTest5119SkipFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "skip"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest5119SkipFragment",
  "selections": [
    {
      "condition": "skip",
      "kind": "Condition",
      "passingValue": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "firstName",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "88cf40a594035eba772bb2d820815fdb";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayResponseNormalizerTest5119SkipFragment$fragmentType,
  RelayResponseNormalizerTest5119SkipFragment$data,
>*/);
