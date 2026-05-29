/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<69343e7d256aa9088169a07c4a6d9186>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest65Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest65Fragment$data = {
  readonly id: string,
  readonly $fragmentType: RelayMockPayloadGeneratorTest65Fragment$fragmentType,
};
export type RelayMockPayloadGeneratorTest65Fragment$key = {
  readonly $data?: RelayMockPayloadGeneratorTest65Fragment$data,
  readonly $fragmentSpreads: RelayMockPayloadGeneratorTest65Fragment$fragmentType,
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
  (node/*:: as any*/).hash = "3831685a691916b28305c9d55694bb7d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockPayloadGeneratorTest65Fragment$fragmentType,
  RelayMockPayloadGeneratorTest65Fragment$data,
>*/);
