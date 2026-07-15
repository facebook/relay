/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<820d50bfd5fff356cc702cf00aac0a77>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useLazyLoadQueryNodeFastRefreshTestUserFragment$fragmentType: FragmentType;
export type useLazyLoadQueryNodeFastRefreshTestUserFragment$data = {
  readonly name: ?string,
  readonly $fragmentType: useLazyLoadQueryNodeFastRefreshTestUserFragment$fragmentType,
};
export type useLazyLoadQueryNodeFastRefreshTestUserFragment$key = {
  readonly $data?: useLazyLoadQueryNodeFastRefreshTestUserFragment$data,
  readonly $fragmentSpreads: useLazyLoadQueryNodeFastRefreshTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useLazyLoadQueryNodeFastRefreshTestUserFragment",
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
  (node/*:: as any*/).hash = "8e11c134c00f9c403402ed2888eaa8d8";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useLazyLoadQueryNodeFastRefreshTestUserFragment$fragmentType,
  useLazyLoadQueryNodeFastRefreshTestUserFragment$data,
>*/);
