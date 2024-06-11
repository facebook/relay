/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<821653ff1ca2cd39dc124bcef12486b7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest61Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest61Fragment$data = {|
  +name: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest61Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest61Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest61Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest61Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest61Fragment",
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
  (node/*: any*/).hash = "187c2abd3d1971151e500cd7a751e8db";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest61Fragment$fragmentType,
  RelayMockPayloadGeneratorTest61Fragment$data,
>*/);
