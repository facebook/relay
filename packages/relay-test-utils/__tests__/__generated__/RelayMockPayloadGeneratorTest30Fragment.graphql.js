/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1311e77dc2b1518152d1463401626ebb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest30Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest30Fragment$data = {|
  +id: string,
  +userName: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest30Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest30Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest30Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest30Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest30Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": "userName",
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
  (node/*: any*/).hash = "3677bb2a7a0b0d2733643212c412e05d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest30Fragment$fragmentType,
  RelayMockPayloadGeneratorTest30Fragment$data,
>*/);
