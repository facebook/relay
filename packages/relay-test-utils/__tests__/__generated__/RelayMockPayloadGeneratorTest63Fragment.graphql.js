/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9cb6a1be081537a3a230129615cb5bbb>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest63Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest63Fragment$data = {|
  +name: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest63Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest63Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest63Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest63Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest63Fragment",
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
  (node/*:: as any*/).hash = "d578188aec90e32d00b5f17443580737";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockPayloadGeneratorTest63Fragment$fragmentType,
  RelayMockPayloadGeneratorTest63Fragment$data,
>*/);
