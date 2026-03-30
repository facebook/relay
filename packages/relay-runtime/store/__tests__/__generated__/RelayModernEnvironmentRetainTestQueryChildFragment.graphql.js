/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a465e9baf018413d846c53fbd67c1705>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentRetainTestQueryChildFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentRetainTestQueryChildFragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentRetainTestQueryChildFragment$fragmentType,
|};
export type RelayModernEnvironmentRetainTestQueryChildFragment$key = {
  +$data?: RelayModernEnvironmentRetainTestQueryChildFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentRetainTestQueryChildFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentRetainTestQueryChildFragment",
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
  (node/*:: as any*/).hash = "7e69889c742314270a6b436c846a7bc5";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentRetainTestQueryChildFragment$fragmentType,
  RelayModernEnvironmentRetainTestQueryChildFragment$data,
>*/);
