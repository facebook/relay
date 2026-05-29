/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e54a7aa333ad989f71b3679c9656babc>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useLazyLoadQueryNodeActivityTestUserFragment$fragmentType: FragmentType;
export type useLazyLoadQueryNodeActivityTestUserFragment$data = {
  readonly name: ?string,
  readonly $fragmentType: useLazyLoadQueryNodeActivityTestUserFragment$fragmentType,
};
export type useLazyLoadQueryNodeActivityTestUserFragment$key = {
  readonly $data?: useLazyLoadQueryNodeActivityTestUserFragment$data,
  readonly $fragmentSpreads: useLazyLoadQueryNodeActivityTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useLazyLoadQueryNodeActivityTestUserFragment",
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
  (node/*:: as any*/).hash = "fba8acc72a741b83df0901a91067965e";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useLazyLoadQueryNodeActivityTestUserFragment$fragmentType,
  useLazyLoadQueryNodeActivityTestUserFragment$data,
>*/);
