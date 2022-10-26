/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bc714edae6e3b7d0d0b20e50cba6d309>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest10Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest10Fragment$data = {|
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTest10Fragment$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTest10Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest10Fragment$data,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest10Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest10Fragment",
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
  (node/*: any*/).hash = "483daf1b6255511ef46294a24d84d5d0";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentTypeRefinementTest10Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest10Fragment$data,
>*/);
