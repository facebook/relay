/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<aa30845be120755cebb477adf17bcdf7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest6Fragment$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTest6Fragment$fragmentType: RelayResponseNormalizerTest6Fragment$ref;
export type RelayResponseNormalizerTest6Fragment = {|
  +id: string,
  +name: ?string,
  +$refType: RelayResponseNormalizerTest6Fragment$ref,
|};
export type RelayResponseNormalizerTest6Fragment$data = RelayResponseNormalizerTest6Fragment;
export type RelayResponseNormalizerTest6Fragment$key = {
  +$data?: RelayResponseNormalizerTest6Fragment$data,
  +$fragmentRefs: RelayResponseNormalizerTest6Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest6Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
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
  (node/*: any*/).hash = "b36b98e9fcb8f74e81947212f0853117";
}

module.exports = node;
