/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dd4ea5135f9af1d465ddeccb3c326ea0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest2Fragment$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTest2Fragment$fragmentType: RelayResponseNormalizerTest2Fragment$ref;
export type RelayResponseNormalizerTest2Fragment = {|
  +id: string,
  +name: ?string,
  +$refType: RelayResponseNormalizerTest2Fragment$ref,
|};
export type RelayResponseNormalizerTest2Fragment$data = RelayResponseNormalizerTest2Fragment;
export type RelayResponseNormalizerTest2Fragment$key = {
  +$data?: RelayResponseNormalizerTest2Fragment$data,
  +$fragmentRefs: RelayResponseNormalizerTest2Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest2Fragment",
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
  (node/*: any*/).hash = "d0fabdf19c8fb15f941fd3e6b6f272e9";
}

module.exports = node;
