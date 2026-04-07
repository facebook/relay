/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ba1c44c23ac079cab1d388b2ddc5abb7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentNodeTestNestedUserFragment$fragmentType: FragmentType;
export type useFragmentNodeTestNestedUserFragment$data = {|
  +username: ?string,
  +$fragmentType: useFragmentNodeTestNestedUserFragment$fragmentType,
|};
export type useFragmentNodeTestNestedUserFragment$key = {
  +$data?: useFragmentNodeTestNestedUserFragment$data,
  +$fragmentSpreads: useFragmentNodeTestNestedUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useFragmentNodeTestNestedUserFragment",
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
  (node/*:: as any*/).hash = "7df58100acef7d8089718c3f37997999";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useFragmentNodeTestNestedUserFragment$fragmentType,
  useFragmentNodeTestNestedUserFragment$data,
>*/);
