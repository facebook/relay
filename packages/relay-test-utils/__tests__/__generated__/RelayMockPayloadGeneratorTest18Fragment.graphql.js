/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f4e5afbc9aa7ad1473b82f0f6f2599b5>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest18Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest18Fragment$data = {
  readonly id: string,
  readonly name: ?string,
  readonly username: ?string,
  readonly $fragmentType: RelayMockPayloadGeneratorTest18Fragment$fragmentType,
};
export type RelayMockPayloadGeneratorTest18Fragment$key = {
  readonly $data?: RelayMockPayloadGeneratorTest18Fragment$data,
  readonly $fragmentSpreads: RelayMockPayloadGeneratorTest18Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest18Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "76104cba704e4b97b50a9771c640409d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockPayloadGeneratorTest18Fragment$fragmentType,
  RelayMockPayloadGeneratorTest18Fragment$data,
>*/);
