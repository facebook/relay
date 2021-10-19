/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b93cdd606b15c19525746e57617b7e47>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest4Fragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentTypeRefinementTest4Fragment$fragmentType: RelayModernEnvironmentTypeRefinementTest4Fragment$ref;
export type RelayModernEnvironmentTypeRefinementTest4Fragment = {|
  +url: ?string,
  +$refType: RelayModernEnvironmentTypeRefinementTest4Fragment$ref,
|};
export type RelayModernEnvironmentTypeRefinementTest4Fragment$data = RelayModernEnvironmentTypeRefinementTest4Fragment;
export type RelayModernEnvironmentTypeRefinementTest4Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest4Fragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest4Fragment$ref,
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

module.exports = node;
