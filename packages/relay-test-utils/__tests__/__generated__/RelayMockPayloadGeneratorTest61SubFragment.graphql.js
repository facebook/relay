/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0d68aa0175ceb417fe119c6431b1dfda>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest61SubFragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest61SubFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest61SubFragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest61SubFragment$key = {
  +$data?: RelayMockPayloadGeneratorTest61SubFragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest61SubFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest61SubFragment",
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
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "3c22efb98076b78b92f80b216c9ebe16";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockPayloadGeneratorTest61SubFragment$fragmentType,
  RelayMockPayloadGeneratorTest61SubFragment$data,
>*/);
