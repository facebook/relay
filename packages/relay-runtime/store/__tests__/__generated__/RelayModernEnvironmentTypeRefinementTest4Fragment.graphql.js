/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3832dc305e7249216f087112d151d281>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest4Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest4Fragment$data = {|
  +url: ?string,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTest4Fragment$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTest4Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest4Fragment$data,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest4Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest4Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "url",
      "storageKey": null
    }
  ],
  "type": "Entity",
  "abstractKey": "__isEntity"
};

if (__DEV__) {
  (node/*: any*/).hash = "d70049fba3a5f253860b0b2de00476e5";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentTypeRefinementTest4Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest4Fragment$data,
>*/);
