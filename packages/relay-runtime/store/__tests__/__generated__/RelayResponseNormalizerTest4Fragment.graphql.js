/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<606ffffc3960f2ca4e51e9f9d690909f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest4Fragment$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTest4Fragment$fragmentType: RelayResponseNormalizerTest4Fragment$ref;
export type RelayResponseNormalizerTest4Fragment = {|
  +id: string,
  +name: ?string,
  +$refType: RelayResponseNormalizerTest4Fragment$ref,
|};
export type RelayResponseNormalizerTest4Fragment$data = RelayResponseNormalizerTest4Fragment;
export type RelayResponseNormalizerTest4Fragment$key = {
  +$data?: RelayResponseNormalizerTest4Fragment$data,
  +$fragmentRefs: RelayResponseNormalizerTest4Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest4Fragment",
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
  (node/*: any*/).hash = "b6997ee42173a86ee78c7058892f90f7";
}

module.exports = node;
