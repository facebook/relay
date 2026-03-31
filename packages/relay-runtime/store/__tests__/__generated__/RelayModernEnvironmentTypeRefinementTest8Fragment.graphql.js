/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d4fe81a82a9001c0341b0c29db5f8440>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest8Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest8Fragment$data = {|
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTest8Fragment$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTest8Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest8Fragment$data,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest8Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest8Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "Named",
  "abstractKey": "__isNamed"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "ec9c5fd99f2d4024b977fb2f73e2e60a";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentTypeRefinementTest8Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest8Fragment$data,
>*/);
