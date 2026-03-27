/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e9c4dab0910a58cbf9c330450fc5ee17>>
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
  (node/*: any*/).hash = "c46b0829f0de24d28fd4df2f2472280f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest66Fragment$fragmentType,
  RelayMockPayloadGeneratorTest66Fragment$data,
>*/);
