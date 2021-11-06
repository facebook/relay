/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9e66db5d5a81e3064712e155469e788c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest12Fragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentTypeRefinementTest12Fragment$fragmentType: RelayModernEnvironmentTypeRefinementTest12Fragment$ref;
export type RelayModernEnvironmentTypeRefinementTest12Fragment = {|
  +name: ?string,
  +$refType: RelayModernEnvironmentTypeRefinementTest12Fragment$ref,
|};
export type RelayModernEnvironmentTypeRefinementTest12Fragment$data = RelayModernEnvironmentTypeRefinementTest12Fragment;
export type RelayModernEnvironmentTypeRefinementTest12Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest12Fragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest12Fragment$ref,
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

module.exports = node;
