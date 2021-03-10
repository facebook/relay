/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<de417c32531d0c5d561d0c04c77194a0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest2Fragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentTypeRefinementTest2Fragment$fragmentType: RelayModernEnvironmentTypeRefinementTest2Fragment$ref;
export type RelayModernEnvironmentTypeRefinementTest2Fragment = {|
  +lastName: ?string,
  +$refType: RelayModernEnvironmentTypeRefinementTest2Fragment$ref,
|};
export type RelayModernEnvironmentTypeRefinementTest2Fragment$data = RelayModernEnvironmentTypeRefinementTest2Fragment;
export type RelayModernEnvironmentTypeRefinementTest2Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest2Fragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest2Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest2Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lastName",
      "storageKey": null
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};

if (__DEV__) {
  (node/*: any*/).hash = "b238b8d5249ae16a165ca546ff22fd0f";
}

module.exports = node;
