/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<45ac0d1e09028580255dc7dfe9fec594>>
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
export type useRefetchableFragmentNodeTestNestedUserFragment$data = {|
  +username: ?string,
  +$fragmentType: useRefetchableFragmentNodeTestNestedUserFragment$fragmentType,
|};
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
