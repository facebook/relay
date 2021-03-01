/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<62904fa433afac4764cb5754bc6f7343>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest5Fragment$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTest5Fragment$fragmentType: RelayResponseNormalizerTest5Fragment$ref;
export type RelayResponseNormalizerTest5Fragment = {|
  +name: ?string,
  +$refType: RelayResponseNormalizerTest5Fragment$ref,
|};
export type RelayResponseNormalizerTest5Fragment$data = RelayResponseNormalizerTest5Fragment;
export type RelayResponseNormalizerTest5Fragment$key = {
  +$data?: RelayResponseNormalizerTest5Fragment$data,
  +$fragmentRefs: RelayResponseNormalizerTest5Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest5Fragment",
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
  (node/*: any*/).hash = "0f913929d59d51798f881b608c35497e";
}

module.exports = node;
