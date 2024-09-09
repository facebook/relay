/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<84e8920f16ea348e5b84ef7d02c76afb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest65Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest65Fragment$data = {|
  +id: string,
  +$fragmentType: RelayMockPayloadGeneratorTest65Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest65Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest65Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest65Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest65Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "3831685a691916b28305c9d55694bb7d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest65Fragment$fragmentType,
  RelayMockPayloadGeneratorTest65Fragment$data,
>*/);
