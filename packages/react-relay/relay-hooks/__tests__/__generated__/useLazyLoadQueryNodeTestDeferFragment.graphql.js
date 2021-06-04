/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9214fda1ce101b3bbdd1b98bb9be170c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useLazyLoadQueryNodeTestDeferFragment$ref: FragmentReference;
declare export opaque type useLazyLoadQueryNodeTestDeferFragment$fragmentType: useLazyLoadQueryNodeTestDeferFragment$ref;
export type useLazyLoadQueryNodeTestDeferFragment = {|
  +id: string,
  +name: ?string,
  +$refType: useLazyLoadQueryNodeTestDeferFragment$ref,
|};
export type useLazyLoadQueryNodeTestDeferFragment$data = useLazyLoadQueryNodeTestDeferFragment;
export type useLazyLoadQueryNodeTestDeferFragment$key = {
  +$data?: useLazyLoadQueryNodeTestDeferFragment$data,
  +$fragmentRefs: useLazyLoadQueryNodeTestDeferFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useLazyLoadQueryNodeTestDeferFragment",
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
  (node/*: any*/).hash = "2d48898c3a90b822fb98b540f990f3ad";
}

module.exports = node;
