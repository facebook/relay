/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<314079a6b064b75d5dd6149505b370f2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$ref: FragmentReference;
declare export opaque type useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$fragmentType: useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$ref;
export type useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment = {|
  +username: ?string,
  +$refType: useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$ref,
|};
export type useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$data = useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment;
export type useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$key = {
  +$data?: useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$data,
  +$fragmentRefs: useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment$ref,
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

module.exports = node;
