/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<768d20b3538f59490e997f542eeebd06>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest6Fragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType: RelayModernEnvironmentTypeRefinementTest6Fragment$ref;
export type RelayModernEnvironmentTypeRefinementTest6Fragment = {|
  +name: ?string,
  +$refType: RelayModernEnvironmentTypeRefinementTest6Fragment$ref,
|};
export type RelayModernEnvironmentTypeRefinementTest6Fragment$data = RelayModernEnvironmentTypeRefinementTest6Fragment;
export type RelayModernEnvironmentTypeRefinementTest6Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest6Fragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest6Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest6Fragment",
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
  (node/*: any*/).hash = "56861ad3b4a9af275e12050dc98488c6";
}

module.exports = node;
