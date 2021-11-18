/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<32daa68e40b12fe38aae11ea43d27795>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTestNestedUserFragment$fragmentType: FragmentType;
export type useRefetchableFragmentNodeTestNestedUserFragment$ref = useRefetchableFragmentNodeTestNestedUserFragment$fragmentType;
export type useRefetchableFragmentNodeTestNestedUserFragment$data = {|
  +username: ?string,
  +$fragmentType: useRefetchableFragmentNodeTestNestedUserFragment$fragmentType,
|};
export type useRefetchableFragmentNodeTestNestedUserFragment = useRefetchableFragmentNodeTestNestedUserFragment$data;
export type useRefetchableFragmentNodeTestNestedUserFragment$key = {
  +$data?: useRefetchableFragmentNodeTestNestedUserFragment$data,
  +$fragmentSpreads: useRefetchableFragmentNodeTestNestedUserFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  useRefetchableFragmentNodeTestNestedUserFragment$fragmentType,
  useRefetchableFragmentNodeTestNestedUserFragment$data,
>*/);
