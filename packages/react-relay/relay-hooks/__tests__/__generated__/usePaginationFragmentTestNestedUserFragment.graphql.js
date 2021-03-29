/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c683adf63b372eea5b94ca3d2889c7fa>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type usePaginationFragmentTestNestedUserFragment$ref: FragmentReference;
declare export opaque type usePaginationFragmentTestNestedUserFragment$fragmentType: usePaginationFragmentTestNestedUserFragment$ref;
export type usePaginationFragmentTestNestedUserFragment = {|
  +username: ?string,
  +$refType: usePaginationFragmentTestNestedUserFragment$ref,
|};
export type usePaginationFragmentTestNestedUserFragment$data = usePaginationFragmentTestNestedUserFragment;
export type usePaginationFragmentTestNestedUserFragment$key = {
  +$data?: usePaginationFragmentTestNestedUserFragment$data,
  +$fragmentRefs: usePaginationFragmentTestNestedUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "usePaginationFragmentTestNestedUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d9264b58ca5ba023a29d467288406def";
}

module.exports = node;
