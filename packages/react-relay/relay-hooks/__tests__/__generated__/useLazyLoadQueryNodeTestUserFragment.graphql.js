/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6e1d9c29bc8e0b44a4079c53267191ae>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useLazyLoadQueryNodeTestUserFragment$ref: FragmentReference;
declare export opaque type useLazyLoadQueryNodeTestUserFragment$fragmentType: useLazyLoadQueryNodeTestUserFragment$ref;
export type useLazyLoadQueryNodeTestUserFragment = {|
  +name: ?string,
  +$refType: useLazyLoadQueryNodeTestUserFragment$ref,
|};
export type useLazyLoadQueryNodeTestUserFragment$data = useLazyLoadQueryNodeTestUserFragment;
export type useLazyLoadQueryNodeTestUserFragment$key = {
  +$data?: useLazyLoadQueryNodeTestUserFragment$data,
  +$fragmentRefs: useLazyLoadQueryNodeTestUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useLazyLoadQueryNodeTestUserFragment",
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
  (node/*: any*/).hash = "90860ff39f89e2594e3eefcb64f7c8fb";
}

module.exports = node;
