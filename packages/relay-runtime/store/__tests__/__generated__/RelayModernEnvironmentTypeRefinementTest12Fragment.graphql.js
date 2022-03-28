/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dda46bfc672446c7bc60d1440f1a1a87>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest12Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest12Fragment$data = {|
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTest12Fragment$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTest12Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest12Fragment$data,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest12Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest12Fragment",
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
  (node/*: any*/).hash = "d51cfb7d710ce0f30e7dd89a439bb5cb";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentTypeRefinementTest12Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest12Fragment$data,
>*/);
