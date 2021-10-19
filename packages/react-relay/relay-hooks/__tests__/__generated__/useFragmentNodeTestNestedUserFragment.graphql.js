/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<601d45b396c1f96906928a5bff62e237>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useFragmentNodeTestNestedUserFragment$ref: FragmentReference;
declare export opaque type useFragmentNodeTestNestedUserFragment$fragmentType: useFragmentNodeTestNestedUserFragment$ref;
export type useFragmentNodeTestNestedUserFragment = {|
  +username: ?string,
  +$refType: useFragmentNodeTestNestedUserFragment$ref,
|};
export type useFragmentNodeTestNestedUserFragment$data = useFragmentNodeTestNestedUserFragment;
export type useFragmentNodeTestNestedUserFragment$key = {
  +$data?: useFragmentNodeTestNestedUserFragment$data,
  +$fragmentRefs: useFragmentNodeTestNestedUserFragment$ref,
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
  (node/*: any*/).hash = "7df58100acef7d8089718c3f37997999";
}

module.exports = node;
