/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e926cf5fb8712937311b79e074763d9d>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest30Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest30Fragment$data = {
  readonly id: string,
  readonly userName: ?string,
  readonly $fragmentType: RelayMockPayloadGeneratorTest30Fragment$fragmentType,
};
export type RelayMockPayloadGeneratorTest30Fragment$key = {
  readonly $data?: RelayMockPayloadGeneratorTest30Fragment$data,
  readonly $fragmentSpreads: RelayMockPayloadGeneratorTest30Fragment$fragmentType,
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
  (node/*:: as any*/).hash = "3677bb2a7a0b0d2733643212c412e05d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockPayloadGeneratorTest30Fragment$fragmentType,
  RelayMockPayloadGeneratorTest30Fragment$data,
>*/);
