/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<06a65621eaf75b95d711f82157629e7e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTestNestedUserFragment$ref: FragmentReference;
declare export opaque type useRefetchableFragmentNodeTestNestedUserFragment$fragmentType: useRefetchableFragmentNodeTestNestedUserFragment$ref;
export type useRefetchableFragmentNodeTestNestedUserFragment = {|
  +username: ?string,
  +$refType: useRefetchableFragmentNodeTestNestedUserFragment$ref,
|};
export type useRefetchableFragmentNodeTestNestedUserFragment$data = useRefetchableFragmentNodeTestNestedUserFragment;
export type useRefetchableFragmentNodeTestNestedUserFragment$key = {
  +$data?: useRefetchableFragmentNodeTestNestedUserFragment$data,
  +$fragmentRefs: useRefetchableFragmentNodeTestNestedUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useRefetchableFragmentNodeTestNestedUserFragment",
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
  (node/*: any*/).hash = "3d7b6ccde06066a85db570cc5a35ddeb";
}

module.exports = node;
