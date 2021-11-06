/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fb17a858679168bbbe897c3427a51ca2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useRefetchableFragmentTestNestedUserFragment$ref: FragmentReference;
declare export opaque type useRefetchableFragmentTestNestedUserFragment$fragmentType: useRefetchableFragmentTestNestedUserFragment$ref;
export type useRefetchableFragmentTestNestedUserFragment = {|
  +username: ?string,
  +$refType: useRefetchableFragmentTestNestedUserFragment$ref,
|};
export type useRefetchableFragmentTestNestedUserFragment$data = useRefetchableFragmentTestNestedUserFragment;
export type useRefetchableFragmentTestNestedUserFragment$key = {
  +$data?: useRefetchableFragmentTestNestedUserFragment$data,
  +$fragmentRefs: useRefetchableFragmentTestNestedUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useRefetchableFragmentTestNestedUserFragment",
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
  (node/*: any*/).hash = "21d3d4e938aaac9fad56a163df5f1914";
}

module.exports = node;
