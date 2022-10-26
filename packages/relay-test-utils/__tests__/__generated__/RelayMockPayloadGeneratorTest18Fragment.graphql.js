/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<87e50a2bae40d2b9cd37a949b5dd0b0f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest18Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest18Fragment$data = {|
  +id: string,
  +name: ?string,
  +username: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest18Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest18Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest18Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest18Fragment$fragmentType,
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
  (node/*: any*/).hash = "76104cba704e4b97b50a9771c640409d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest18Fragment$fragmentType,
  RelayMockPayloadGeneratorTest18Fragment$data,
>*/);
