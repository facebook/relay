/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<25752eb32ba8c5af150b9a9dd4fb6e02>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest62Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest62Fragment$data = {|
  +name: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest62Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest62Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest62Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest62Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest62Fragment",
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
  (node/*: any*/).hash = "87cd4b83c43a1d7b629878f7ecdec518";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest62Fragment$fragmentType,
  RelayMockPayloadGeneratorTest62Fragment$data,
>*/);
