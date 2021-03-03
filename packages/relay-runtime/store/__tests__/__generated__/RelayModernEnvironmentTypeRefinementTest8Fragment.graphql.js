/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bb9d79186156748549c2f8c868caefb3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest8Fragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentTypeRefinementTest8Fragment$fragmentType: RelayModernEnvironmentTypeRefinementTest8Fragment$ref;
export type RelayModernEnvironmentTypeRefinementTest8Fragment = {|
  +name: ?string,
  +$refType: RelayModernEnvironmentTypeRefinementTest8Fragment$ref,
|};
export type RelayModernEnvironmentTypeRefinementTest8Fragment$data = RelayModernEnvironmentTypeRefinementTest8Fragment;
export type RelayModernEnvironmentTypeRefinementTest8Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest8Fragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest8Fragment$ref,
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
  (node/*: any*/).hash = "ec9c5fd99f2d4024b977fb2f73e2e60a";
}

module.exports = node;
