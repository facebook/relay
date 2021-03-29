/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<918b18494617b6295a54f0303e77997e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useLazyLoadQueryNodeFastRefreshTestUserFragment$ref: FragmentReference;
declare export opaque type useLazyLoadQueryNodeFastRefreshTestUserFragment$fragmentType: useLazyLoadQueryNodeFastRefreshTestUserFragment$ref;
export type useLazyLoadQueryNodeFastRefreshTestUserFragment = {|
  +name: ?string,
  +$refType: useLazyLoadQueryNodeFastRefreshTestUserFragment$ref,
|};
export type useLazyLoadQueryNodeFastRefreshTestUserFragment$data = useLazyLoadQueryNodeFastRefreshTestUserFragment;
export type useLazyLoadQueryNodeFastRefreshTestUserFragment$key = {
  +$data?: useLazyLoadQueryNodeFastRefreshTestUserFragment$data,
  +$fragmentRefs: useLazyLoadQueryNodeFastRefreshTestUserFragment$ref,
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
  (node/*: any*/).hash = "8e11c134c00f9c403402ed2888eaa8d8";
}

module.exports = node;
