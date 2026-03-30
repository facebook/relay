/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<90dc9bcf2380e361e46b58c33c69f3e8>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest66Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest66Fragment$data = {|
  +id: string,
  +$fragmentType: RelayMockPayloadGeneratorTest66Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest66Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest66Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest66Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest66Fragment",
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
  (node/*:: as any*/).hash = "c46b0829f0de24d28fd4df2f2472280f";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockPayloadGeneratorTest66Fragment$fragmentType,
  RelayMockPayloadGeneratorTest66Fragment$data,
>*/);
