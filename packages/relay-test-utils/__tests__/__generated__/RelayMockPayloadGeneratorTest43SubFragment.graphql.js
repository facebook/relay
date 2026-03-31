/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6100e6c9f05afd3552511967294e3370>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest43SubFragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest43SubFragment$data = {|
  +name: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest43SubFragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest43SubFragment$key = {
  +$data?: RelayMockPayloadGeneratorTest43SubFragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest43SubFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest43SubFragment",
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
  (node/*:: as any*/).hash = "78bedc2e0923425cab69f0d92b548f1f";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockPayloadGeneratorTest43SubFragment$fragmentType,
  RelayMockPayloadGeneratorTest43SubFragment$data,
>*/);
