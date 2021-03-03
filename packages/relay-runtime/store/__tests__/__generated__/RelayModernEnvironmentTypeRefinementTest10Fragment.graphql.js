/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ef7190efcc1eaae1c1c8f6dcb4a92a08>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest10Fragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentTypeRefinementTest10Fragment$fragmentType: RelayModernEnvironmentTypeRefinementTest10Fragment$ref;
export type RelayModernEnvironmentTypeRefinementTest10Fragment = {|
  +name: ?string,
  +$refType: RelayModernEnvironmentTypeRefinementTest10Fragment$ref,
|};
export type RelayModernEnvironmentTypeRefinementTest10Fragment$data = RelayModernEnvironmentTypeRefinementTest10Fragment;
export type RelayModernEnvironmentTypeRefinementTest10Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest10Fragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest10Fragment$ref,
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

module.exports = node;
