/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<10dfc30fc9e62bdac4fb811ff8a1187e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$fragmentType: FragmentType;
export type useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$data = {
  readonly username: ?string,
  readonly $fragmentType: useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$fragmentType,
};
export type useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$key = {
  readonly $data?: useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$data,
  readonly $fragmentSpreads: useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment",
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
  (node/*:: as any*/).hash = "3fc88d644a0a4729fad8c22506a29f36";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$fragmentType,
  useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$data,
>*/);
