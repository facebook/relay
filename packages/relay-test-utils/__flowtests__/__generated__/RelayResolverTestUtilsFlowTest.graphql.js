/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<897816ca89aa26b451004cda070e114e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResolverTestUtilsFlowTest$ref: FragmentReference;
declare export opaque type RelayResolverTestUtilsFlowTest$fragmentType: RelayResolverTestUtilsFlowTest$ref;
export type RelayResolverTestUtilsFlowTest = {|
  +name: ?string,
  +$refType: RelayResolverTestUtilsFlowTest$ref,
|};
export type RelayResolverTestUtilsFlowTest$data = RelayResolverTestUtilsFlowTest;
export type RelayResolverTestUtilsFlowTest$key = {
  +$data?: RelayResolverTestUtilsFlowTest$data,
  +$fragmentRefs: RelayResolverTestUtilsFlowTest$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResolverTestUtilsFlowTest",
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
  (node/*: any*/).hash = "f3f6718b7cf618c97293b5882ccc96c0";
}

module.exports = node;
