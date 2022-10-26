/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8f4b0aac4120f11d442c4307930ad342>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$fragmentType: FragmentType;
export type useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$data = {|
  +username: ?string,
  +$fragmentType: useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$fragmentType,
|};
export type useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$key = {
  +$data?: useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$data,
  +$fragmentSpreads: useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$fragmentType,
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
  (node/*: any*/).hash = "3fc88d644a0a4729fad8c22506a29f36";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$fragmentType,
  useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$data,
>*/);
