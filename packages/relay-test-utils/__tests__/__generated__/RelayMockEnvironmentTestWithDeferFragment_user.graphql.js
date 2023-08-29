/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<adb7a6584e3958fc4ea3b23e8db9b410>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockEnvironmentTestWithDeferFragment_user$fragmentType: FragmentType;
export type RelayMockEnvironmentTestWithDeferFragment_user$data = {|
  +name: ?string,
  +$fragmentType: RelayMockEnvironmentTestWithDeferFragment_user$fragmentType,
|};
export type RelayMockEnvironmentTestWithDeferFragment_user$key = {
  +$data?: RelayMockEnvironmentTestWithDeferFragment_user$data,
  +$fragmentSpreads: RelayMockEnvironmentTestWithDeferFragment_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockEnvironmentTestWithDeferFragment_user",
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
  (node/*: any*/).hash = "8dc1299ed092ea4af23f5e39ab2f345a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockEnvironmentTestWithDeferFragment_user$fragmentType,
  RelayMockEnvironmentTestWithDeferFragment_user$data,
>*/);
